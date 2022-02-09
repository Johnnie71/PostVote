import React from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useRouter } from "next/router";
import { usePostQuery } from "../../generated/graphql";
import Layout from "../../components/Layout";
import { Box, Heading } from "@chakra-ui/react";

const Post = () => {
	const router = useRouter();
	const intId =
		typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
	const [{ data, error, fetching }] = usePostQuery({
		pause: intId === -1,
		variables: {
			id: intId,
		},
	});

	if (fetching) {
		return (
			<Layout>
				<div>loading...</div>
			</Layout>
		);
	}

	if (error) {
		return <div>{error.message}</div>;
	}

	if (!data) {
		<Box>could not find post</Box>;
	}

	return (
		<Layout>
			<Heading>{data?.post?.title}</Heading>
			{data?.post?.text}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
