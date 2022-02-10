import DataLoader from "dataloader";
import { Upvote } from "src/entities/Upvote";
import { User } from "../entities/User";

export const createVoteLoader = () =>
	new DataLoader<{ postId: number; userId: number }, Upvote | null>(
		async (keys) => {
			const theVotes = await Upvote.findByIds(keys as any);
			const theVoteIdsToVote: Record<string, Upvote> = {};
			theVotes.forEach((vote) => {
				theVoteIdsToVote[`${vote.userId} | ${vote.postId}`] = vote;
			});

			return keys.map(
				(key) => theVoteIdsToVote[`${key.userId} | ${key.postId}`]
			);
		}
	);
