import React from "react";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery({
		pause: isServer(),
	});

	let body = null;

	// data is loading
	if (fetching) {
		body = null;
	} else if (!data?.me) {
		// user not logged in
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
	} else {
		// user is logged in
		body = (
			<Flex>
				<NextLink href="create-post">
					<Link mr={2}>create post</Link>
				</NextLink>
				<Box mr={2}>{data.me.username}</Box>
				<Button
					onClick={() => {
						logout();
					}}
					isLoading={logoutFetching}
					variant="link"
				>
					Logout
				</Button>
			</Flex>
		);
	}

	return (
		<Flex
			zIndex={1}
			position="sticky"
			top={0}
			bg="tan"
			p={4}
			ml={"auto"}
			align="center"
		>
			<NextLink href="/">
				<Link>
					<Heading>LiReddit</Heading>
				</Link>
			</NextLink>
			<Box ml={"auto"}>{body}</Box>
		</Flex>
	);
};
