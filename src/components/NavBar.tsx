import { Box, Flex, Link, Button } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: fetchingLogout }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  if (fetching) {
    //loading
  } else if (!data?.me) {
    //not logged in
    body = (
      <>
        <NextLink href="/register">
          <Link color="white" mr={2}>
            Register
          </Link>
        </NextLink>
        <NextLink href="login">
          <Link color="white">Login</Link>
        </NextLink>
      </>
    );
  } else {
    //logged in
    body = (
      <Flex>
        <Box mr={2}>Welcome {data.me.username}</Box>
        <Button
          onClick={() => {
            logout();
          }}
          disabled={fetchingLogout}
          variant="link"
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg="tan" p={4}>
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};

export default NavBar;
