import React from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { InputField } from "../../../components/InputField";
import Layout from "../../../components/Layout";
import createPost from "../../create-post";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";

const EditPost = () => {
	const [{ data, fetching }] = useGetPostFromUrl();

	if (fetching) {
		return (
			<Layout>
				<div>loading.....</div>
			</Layout>
		);
	}

	if (!data?.post) {
		return (
			<Layout>
				<div>could not find post</div>
			</Layout>
		);
	}

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: data.post.title, text: data.post.text }}
				onSubmit={async (values) => {
					// const { error } = await createPost({ input: values });
					// if (!error) {
					// 	router.push("/");
					// }
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="title" placeholder="title" label="Title" />
						<Box mt={4}>
							<InputField
								textarea
								name="text"
								placeholder="text..."
								label="Body"
							/>
						</Box>
						<Button
							mt={4}
							type="submit"
							isLoading={isSubmitting}
							colorScheme="teal"
						>
							Update Post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(EditPost);
