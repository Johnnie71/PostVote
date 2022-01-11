import React from "react";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
	const [{ data, fetching }] = useMeQuery();
	let body = null;

	// data is loading
	if (fetching) {
		body = null;
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href={"/login"}>
					<Link colorScheme="white" mr={2}>
						Login
					</Link>
				</NextLink>
				<NextLink href={"/register"}>
					<Link colorScheme="white">Register</Link>
				</NextLink>
			</>
		);
		// user not logged in
	} else {
		body = (
			<Flex>
				<Box mr={2}>{data.me.username}</Box>
				<Button variant="link">Logout</Button>
			</Flex>
		);
		// user is logged in
	}

	return (
		<Flex bg="tomato" p={4} ml={"auto"}>
			<Box ml={"auto"}>{body}</Box>
		</Flex>
	);
};