import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { IconButton, Flex } from "@chakra-ui/react";
import React from "react";
import { PostsQuery } from "../generated/graphql";

interface UpVoteSectionProps {
	post: PostsQuery["posts"]["posts"][0];
}

const VotingSection: React.FC<UpVoteSectionProps> = ({ post }) => {
	return (
		<Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
			<IconButton aria-label="up vote" icon={<ChevronDownIcon />} />
			{post.points}
			<IconButton aria-label="down vote" icon={<ChevronUpIcon />} />
		</Flex>
	);
};

export default VotingSection;
