import React from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const Post = () => {
	return <div></div>;
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
