import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { IconButton, Flex } from "@chakra-ui/react";
import React from "react";
import { useVoteMutation, VoteSnippetFragment } from "../generated/graphql";

interface UpVoteSectionProps {
	post: VoteSnippetFragment;
}

const VotingSection: React.FC<UpVoteSectionProps> = ({ post }) => {
	const [, vote] = useVoteMutation();
	return (
		<Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
			<IconButton
				onClick={() => {
					vote({
						postId: post.id,
						value: 1,
					});
				}}
				aria-label="up vote"
				icon={<ChevronDownIcon />}
			/>
			{post.points}
			<IconButton
				onClick={() => {
					vote({
						postId: post.id,
						value: -1,
					});
				}}
				aria-label="down vote"
				icon={<ChevronUpIcon />}
			/>
		</Flex>
	);
};

export default VotingSection;
