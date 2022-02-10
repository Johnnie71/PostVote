import { createUrqlClient } from "../utils/createUrqlClient";
import {
	useDeletePostMutation,
	useMeQuery,
	usePostsQuery,
	useUpdatePostMutation,
} from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import {
	Box,
	Button,
	Flex,
	Heading,
	IconButton,
	Link,
	Stack,
	Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import VotingSection from "../components/VotingSection";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import EditDeletePostButtons from "../components/EditDeletePostButtons";

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 15,
		cursor: null as null | string,
	});

	const [{ data: meData }] = useMeQuery();

	const [{ data, fetching }] = usePostsQuery({
		variables,
	});

	const [, deletePost] = useDeletePostMutation();

	if (!fetching && !data) {
		return <div>Refresh page</div>;
	}
	return (
		<Layout>
			{!data && fetching ? (
				<div>loading.....</div>
			) : (
				<Stack>
					{data!.posts.posts.map((post) =>
						!post ? null : (
							<Flex key={post.id} p={5} shadow="md" borderWidth="1px">
								<VotingSection post={post} />
								<Box flex={1}>
									<NextLink href="/post/[id]" as={`/post/${post.id}`}>
										<Link>
											<Heading fontSize="xl">{post.title}</Heading>
										</Link>
									</NextLink>
									<Text>posted by {post.creator.username}</Text>
									<Flex align="center">
										<Text flex={1} mt={4}>
											{post.textSnippet}....
										</Text>
										{meData?.me?.id === post.creator.id ? (
											<Box ml="auto">
												<EditDeletePostButtons id={post.id} />
											</Box>
										) : null}
									</Flex>
								</Box>
							</Flex>
						)
					)}
				</Stack>
			)}
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						onClick={() => {
							setVariables({
								limit: variables.limit,
								cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
							});
						}}
						isLoading={fetching}
						colorScheme="cyan"
						m="auto"
						my={4}
					>
						load more
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
