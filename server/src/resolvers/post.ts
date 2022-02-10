import { Post } from "../entities/Post";
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from "type-graphql";
import { MyContext } from "./types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";

@InputType()
class PostInput {
	@Field()
	title: string;
	@Field()
	text: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];
	@Field()
	hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() post: Post) {
		return post.text.slice(0, 50);
	}

	@FieldResolver(() => User)
	creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
		return userLoader.load(post.creatorId);
	}

	@FieldResolver(() => Int, { nullable: true })
	voteStatus(@Root() post: Post, @Ctx() { userLoader }: MyContext) {}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const _isVoting = value !== -1;
		const realValue = _isVoting ? 1 : -1;
		const { userId } = req.session;
		const findVote = await Upvote.findOne({ where: { postId, userId } });

		// user has voted on post before
		// and they are changing their vote
		if (findVote && findVote.value !== realValue) {
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
					UPDATE upvote
					SET VALUE = $1
					WHERE "postId" = $2 AND "userId" = $3
				`,
					[realValue, postId, userId]
				);

				await tm.query(
					`
					UPDATE post
					SET points = points + $1
					WHERE id = $2
				`,
					[2 * realValue, postId]
				);
			});
		} else if (!findVote) {
			// has never voted before
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
					INSERT INTO upvote ("userId", "postId", value)
					VALUES ($1, $2, $3);
				`,
					[userId, postId, realValue]
				);

				await tm.query(
					`
					UPDATE post
					SET points = points + $1
					WHERE id = $2;
				`,
					[realValue, postId]
				);
			});
		}

		return true;
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null,
		@Ctx() { req }: MyContext
	): Promise<PaginatedPosts> {
		// 20 ->21 posts
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;

		const replacements: any[] = [realLimitPlusOne];

		if (req.session.userId) {
			replacements.push(req.session.userId);
		}

		let cursorIdx = 3;
		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
			cursorIdx = replacements.length;
		}

		const posts = await getConnection().query(
			`
			SELECT p.*,
			${
				req.session.userId
					? '(SELECT VALUE FROM upvote WHERE "userId" = $2 AND "postId" = p.id) "voteStatus"'
					: 'null as "voteStatus"'
			}	
			FROM post p
			${cursor ? `WHERE p."createdAt" < $${cursorIdx}` : ""}
			ORDER BY p."createdAt" 
			DESC 
			LIMIT $1
		`,
			replacements
		);

		// const quiryBuiler = getConnection()
		// 	.getRepository(Post)
		// 	.createQueryBuilder("p")
		// 	.innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"' )
		// 	.orderBy('p."createdAt"', "DESC")
		// 	.take(realLimitPlusOne);

		// if (cursor) {
		// 	quiryBuiler.where('p."createdAt" < :cursor', {
		// 		cursor: new Date(parseInt(cursor)),
		// 	});
		// }

		// const posts = await quiryBuiler.getMany();
		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("input") input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return Post.create({
			...input,
			creatorId: req.session.userId,
		}).save();
	}

	@Mutation(() => Post, { nullable: true })
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg("id", () => Int) id: number,
		@Arg("title") title: string,
		@Arg("text") text: string,
		@Ctx() { req }: MyContext
	): Promise<Post | null> {
		const result = getConnection()
			.createQueryBuilder()
			.update(Post)
			.set({ title, text })
			.where('id = :id and "creatorId" = :creatorId', {
				id,
				creatorId: req.session.userId,
			})
			.returning("*")
			.execute();

		return (await result).raw[0];
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async deletePost(
		@Arg("id", () => Int) id: number,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		// ---- not the cascade way
		// const post = await Post.findOne(id);
		// if (!post) {
		// 	return false;
		// }

		// if (post.creatorId !== req.session.userId) {
		// 	throw new Error("not authorized");
		// }

		// await Upvote.delete({ postId: id });
		// await Post.delete({ id });

		await Post.delete({ id, creatorId: req.session.userId });
		return true;
	}
}
