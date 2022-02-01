import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { IconButton, Flex } from "@chakra-ui/react";
import React, { useState } from "react";
import { useVoteMutation, VoteSnippetFragment } from "../generated/graphql";

interface UpVoteSectionProps {
	post: VoteSnippetFragment;
}

const VotingSection: React.FC<UpVoteSectionProps> = ({ post }) => {
	const [loadingState, setLoadingState] = useState<
		"upvote-loading" | "downvote-loading" | "not-loading"
	>("not-loading");
	const [, vote] = useVoteMutation();

	return (
		<Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
			<IconButton
				onClick={async () => {
					setLoadingState("upvote-loading");
					await vote({
						postId: post.id,
						value: 1,
					});
					setLoadingState("not-loading");
				}}
				isLoading={loadingState === "upvote-loading"}
				aria-label="up vote"
				icon={<ChevronDownIcon />}
			/>
			{post.points}
			<IconButton
				onClick={async () => {
					setLoadingState("downvote-loading");
					await vote({
						postId: post.id,
						value: -1,
					});
					setLoadingState("not-loading");
				}}
				isLoading={loadingState === "downvote-loading"}
				aria-label="down vote"
				icon={<ChevronUpIcon />}
			/>
		</Flex>
	);
};

export default VotingSection;
