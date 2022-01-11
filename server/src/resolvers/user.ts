import { User } from "../entities/User";
import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from "type-graphql";
import { MyContext } from "./types";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME } from "src/constants";

@InputType()
class UsernamePasswordInput {
	@Field()
	username: string;
	@Field()
	password: string;
}

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
		if (options.username.length <= 2) {
			return {
				errors: [
					{
						field: "username",
						message: "Username must be greater than 2 characters long.",
					},
				],
			};
		}

		if (options.password.length <= 2) {
			return {
				errors: [
					{
						field: "password",
						message: "Password must be greater than 2 characters long.",
					},
				],
			};
		}
		const hashPassword = await argon2.hash(options.password);
		let user;
		try {
			const result = await (em as EntityManager)
				.createQueryBuilder(User)
				.getKnexQuery()
				.insert({
					username: options.username,
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
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, { username: options.username });
		if (!user) {
			return {
				errors: [
					{
						field: "username",
						message: "That username does not exist",
					},
				],
			};
		}
		const valid = await argon2.verify(user.password, options.password);
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
