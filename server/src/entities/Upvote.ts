import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// Many to many relationship
// user <-> posts
// user -> join table <- posts
// user -> upvote <- posts

@ObjectType()
@Entity()
export class Upvote extends BaseEntity {
	@Field()
	@Column({ type: "int" })
	value: number;

	@Field()
	@PrimaryColumn()
	userId: number;

	@Field()
	@ManyToOne(() => User, (user) => user.upvotes)
	user: User;

	@Field()
	@PrimaryColumn()
	postId: number;

	@Field()
	@ManyToOne(() => Post, (post) => post.upvotes)
	post: Post;
}
