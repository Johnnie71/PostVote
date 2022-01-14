import { NavBar } from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
	const [{ data }] = usePostsQuery();
	return (
		<div>
			<NavBar />
			<div>Hello World!</div>
			{data &&
				data.posts.map((post) => {
					<div key={post.id}>{post.title}</div>;
				})}
		</div>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
