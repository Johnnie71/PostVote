import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
	id: number;
	creatorId: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
	id,
	creatorId,
}) => {
	const [{ data: meData }] = useMeQuery();
	const [, deletePost] = useDeletePostMutation();

	if (meData?.me?.id !== creatorId) {
		return null;
	}
	return (
		<Box>
			<NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
				<IconButton
					colorScheme="yellow"
					aria-label="Update Post"
					icon={<EditIcon />}
					as={Link}
				/>
			</NextLink>
			<IconButton
				ml={3}
				colorScheme="red"
				aria-label="Delete Post"
				icon={<DeleteIcon />}
				onClick={() => {
					deletePost({ id: id });
				}}
			/>
		</Box>
	);
};

export default EditDeletePostButtons;
