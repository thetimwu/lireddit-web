import { Box, Flex, Link, Button, Heading } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [logout, { loading: fetchingLogout }] = useLogoutMutation();
  //since Navbar is included in ssr index page, do not fetching if its client rendring
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  let body = null;
  const router = useRouter();
  const apolloClient = useApolloClient();

  if (loading) {
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
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            Create Post
          </Button>
        </NextLink>
        <Box mr={2}>Welcome {data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout();
            // router.reload();
            await apolloClient.resetStore();
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
    <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4}>
      <Flex flex={1} m="auto" maxW={800} align="center">
        <NextLink href="/">
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box ml="auto">{body}</Box>
      </Flex>
    </Flex>
  );
};

export default NavBar;
