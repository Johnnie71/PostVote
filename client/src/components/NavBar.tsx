import React from "react";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
	const router = useRouter();
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
			<Flex align="center">
				<NextLink href="create-post">
					<Button colorScheme="green" as={Link} mr={4}>
						create post
					</Button>
				</NextLink>
				<Box mr={2}>{data.me.username}</Box>
				<Button
					onClick={async () => {
						await logout();
						router.reload();
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
		<Flex zIndex={1} position="sticky" top={0} bg="tan" p={4}>
			<Flex flex={1} m="auto" align="center" maxW={800}>
				<NextLink href="/">
					<Link>
						<Heading>LiReddit</Heading>
					</Link>
				</NextLink>
				<Box ml={"auto"}>{body}</Box>
			</Flex>
		</Flex>
	);
};
