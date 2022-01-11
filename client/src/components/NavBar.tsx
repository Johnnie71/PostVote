import React from "react";
import { Box, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
	return (
		<Flex bg="tomato" p={4} ml={"auto"}>
			<Box ml={"auto"}>
				<NextLink href={"/login"}>
					<Link colorScheme="white" mr={2}>
						Login
					</Link>
				</NextLink>
				<NextLink href={"/register"}>
					<Link colorScheme="white">Register</Link>
				</NextLink>
			</Box>
		</Flex>
	);
};
