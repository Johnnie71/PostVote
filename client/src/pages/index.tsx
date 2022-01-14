import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
	const [{ data }] = usePostsQuery();
	return (
		<div>
			<NavBar />
			<div>Hello World!</div>
			<br />
			{data &&
				data.posts.map((post) => {
					<div key={post.id}>{post.title}</div>;
				})}
		</div>
	);
};

export default Index;
