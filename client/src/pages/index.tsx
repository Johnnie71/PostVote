import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
	const [{ data }] = usePostsQuery();
	return (
		<Layout>
			<div>Hello World!</div>
			<br />
			{data ? (
				data.posts.map((post) => <div key={post.id}>{post.title}</div>)
			) : (
				<div>Loading.....</div>
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
