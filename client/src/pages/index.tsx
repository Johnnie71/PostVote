import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { Link } from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
	const [{ data }] = usePostsQuery();
	return (
		<Layout>
			<NextLink href="create-post">
				<Link>create post</Link>
			</NextLink>
			<br />
			{data ? (
				data.posts.map((post) => <div key={post.id}>{post.title}</div>)
			) : (
				<div>loading.....</div>
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
