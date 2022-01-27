import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import {
	Box,
	Button,
	Flex,
	Heading,
	Link,
	Stack,
	Text,
} from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
	const [{ data, fetching }] = usePostsQuery({
		variables: {
			limit: 10,
		},
	});

	if (!fetching && !data) {
		return <div>Refresh page</div>;
	}
	return (
		<Layout>
			<Flex align="center">
				<Heading>LiReddit</Heading>
				<NextLink href="create-post">
					<Link ml="auto">create post</Link>
				</NextLink>
			</Flex>
			<br />
			{!data && fetching ? (
				<div>loading.....</div>
			) : (
				<Stack>
					{data!.posts.map((post) => (
						<Box key={post.id} p={5} shadow="md" borderWidth="1px">
							<Heading fontSize="xl">{post.title}</Heading>
							<Text mt={4}>{post.textSnippet}....</Text>
						</Box>
					))}
				</Stack>
			)}
			{data ? (
				<Flex>
					<Button isLoading={fetching} colorScheme="cyan" m="auto" my={4}>
						load more
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
