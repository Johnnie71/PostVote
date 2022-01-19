import { User } from "../entities/User";
import {
	Arg,
	Ctx,
	Field,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from "type-graphql";
import { MyContext } from "./types";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/vaidateRegister";
import { sendEmail } from "src/utils/sendEmail";

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

@Resolver()
export class UserResolver {
	@Mutation(() => Boolean)
	async forgotPassword(@Arg("email") email: string, @Ctx() { em }: MyContext) {
		const user = await em.findOne(User, { email });
		if (!user) {
			// the email is not in the database
			return true;
		}

		await sendEmail(
			email,
			'<a href="http://localhost:3000/change-password/">Reset Password</a>'
		);

		return true;
	}

	@Query(() => User, { nullable: true })
	async me(@Ctx() { req, em }: MyContext) {
		// you are not logged in
		if (!req.session.userId) {
			console.log("Not Logged On!");
			return null;
		}

		const user = await em.findOne(User, { id: req.session.userId });

		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const errors = validateRegister(options);
		if (errors) {
			return { errors };
		}

		const hashPassword = await argon2.hash(options.password);
		let user;
		try {
			const result = await (em as EntityManager)
				.createQueryBuilder(User)
				.getKnexQuery()
				.insert({
					username: options.username,
					email: options.email,
					password: hashPassword,
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning("*");
			user = result[0];
		} catch (err) {
			if (err.detail.includes("already exists")) {
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
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(
			User,
			userNameOrEmail.includes("@")
				? { email: userNameOrEmail }
				: { username: userNameOrEmail }
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
