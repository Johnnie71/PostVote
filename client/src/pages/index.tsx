import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { Box, Heading, Link, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
	const [{ data }] = usePostsQuery({
		variables: {
			limit: 10,
		},
	});
	return (
		<Layout>
			<NextLink href="create-post">
				<Link>create post</Link>
			</NextLink>
			<br />
			{data ? (
				<Stack>
					{data.posts.map((post) => (
						<Box key={post.id} p={5} shadow="md" borderWidth="1px">
							<Heading fontSize="xl">{post.title}</Heading>
							<Text mt={4}>{post.text.slice(0, 50)}</Text>
						</Box>
					))}
				</Stack>
			) : (
				<div>loading.....</div>
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
