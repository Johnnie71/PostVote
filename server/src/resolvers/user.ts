import { User } from "../entities/User";
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
} from "type-graphql";
import { MyContext } from "./types";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/vaidateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
	@Field()
	field: string;
	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver(User)
export class UserResolver {
	@FieldResolver(() => String)
	email(@Root() user: User, @Ctx() { req }: MyContext) {
		// this is the current user and it's ok to show them their email
		if (req.session.userId === user.id) {
			return user.email;
		}

		// if current user wants to see someone elses email
		return "";
	}

	@Mutation(() => UserResponse)
	async changePassword(
		@Arg("token") token: string,
		@Arg("newPassword") newPassword: string,
		@Ctx() { redis, req }: MyContext
	): Promise<UserResponse> {
		if (newPassword.length <= 2) {
			return {
				errors: [
					{ field: "newPassword", message: "length must be greater than 2" },
				],
			};
		}

		const key = FORGET_PASSWORD_PREFIX + token;
		const userId = await redis.get(key);
		if (!userId) {
			return {
				errors: [{ field: "token", message: "token expired" }],
			};
		}

		const userIdNum = parseInt(userId);
		const user = await User.findOne(userIdNum);

		if (!user) {
			return {
				errors: [{ field: "token", message: "user no longer exists" }],
			};
		}

		await User.update(
			{ id: userIdNum },
			{ password: await argon2.hash(newPassword) }
		);

		await redis.del(key); // deleting token from redis so it cant change the password using the same token

		// log in user after changed password
		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg("email") email: string,
		@Ctx() { redis }: MyContext
	) {
		const user = await User.findOne({ where: { email } });
		if (!user) {
			// the email is not in the database
			return true;
		}

		const token = v4(); // generates unique random string for token

		await redis.set(
			FORGET_PASSWORD_PREFIX + token,
			user.id,
			"ex",
			1000 * 60 * 60 * 24 * 3
		); // expires in 3 days

		await sendEmail(
			email,
			`<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
		);

		return true;
	}

	@Query(() => User, { nullable: true })
	me(@Ctx() { req }: MyContext) {
		// you are not logged in
		if (!req.session.userId) {
			console.log("Not Logged On!");
			return null;
		}

		return User.findOne(req.session.userId);
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const errors = validateRegister(options);
		if (errors) {
			return { errors };
		}

		const hashPassword = await argon2.hash(options.password);
		let user;
		try {
			// User.create({
			// 	username: options.username,
			// 	email: options.email,
			// 	password: hashPassword,
			// }).save();
			const result = await getConnection()
				.createQueryBuilder()
				.insert()
				.into(User)
				.values({
					username: options.username,
					email: options.email,
					password: hashPassword,
				})
				.returning("*")
				.execute();
			user = result.raw[0];
		} catch (err) {
			if (err.code === "23505") {
				return {
					errors: [
						{
							field: "username",
							message: "Username already taken.",
						},
					],
				};
			}
		}

		// store user id session
		// this will set a cookie on the user
		// keep them logged in
		req.session.userId = user.id;
		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("usernameOrEmail") userNameOrEmail: string,
		@Arg("password") password: string,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const user = await User.findOne(
			userNameOrEmail.includes("@")
				? { where: { email: userNameOrEmail } }
				: { where: { username: userNameOrEmail } }
		);
		if (!user) {
			return {
				errors: [
					{
						field: "usernameOrEmail",
						message: "That username does not exist",
					},
				],
			};
		}
		const valid = await argon2.verify(user.password, password);
		if (!valid) {
			return {
				errors: [
					{
						field: "password",
						message: "Invalid Password",
					},
				],
			};
		}

		// store user id session
		// this will set a cookie on the user
		// keeping them logged in
		req.session.userId = user.id;

		return {
			user,
		};
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: MyContext) {
		return new Promise((resolve) =>
			req.session.destroy((error) => {
				res.clearCookie(COOKIE_NAME);
				if (error) {
					console.log(error);
					resolve(false);
					return;
				}

				resolve(true);
			})
		);
	}
}
