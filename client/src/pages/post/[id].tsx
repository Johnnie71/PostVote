import React from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useRouter } from "next/router";

const Post = () => {
	const router = useRouter();
	return <div></div>;
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
