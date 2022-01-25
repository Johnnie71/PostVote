import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React, { useEffect } from "react";
import { InputField } from "../components/InputField";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import Layout from "../components/Layout";

const CreatePost: React.FC<{}> = ({}) => {
	const [{ data, fetching }] = useMeQuery(); // to check whether they are logged in or not
	const router = useRouter();

	useEffect(() => {
		if (!fetching && !data?.me) {
			// if it's not loading and there is no user
			router.replace("/login");
		}
	}, [fetching, data, router]);

	const [, createPost] = useCreatePostMutation();
	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: "", text: "" }}
				onSubmit={async (values) => {
					const { error } = await createPost({ input: values });
					if (!error) {
						router.push("/");
					}
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
							Create Post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(CreatePost);
