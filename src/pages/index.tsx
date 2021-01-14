import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import UpdootSection from "../components/UpdootSection";
import { CloseIcon } from "@chakra-ui/icons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  const [, deletePost] = useDeletePostMutation();

  if (!data && !fetching) {
    return <div>you got query failed for some reason</div>;
  }

  return (
    <Layout>
      {!data && fetching ? (
        <div>loading</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((post) => {
            return !post ? null : (
              <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection post={post} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                    <Link>
                      <Heading fontSize="xl">{post.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>posted by {post.creator.username}</Text>
                  <Flex>
                    <Text mt={4}>{post.textSnippet}</Text>
                    <IconButton
                      ml="auto"
                      variant="outline"
                      colorScheme="red"
                      aria-label="Delete Post"
                      fontSize="20px"
                      icon={<CloseIcon />}
                      onClick={() => {
                        deletePost({ id: post.id });
                      }}
                    />
                  </Flex>
                </Box>
              </Flex>
            );
          })}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            m="auto"
            my={8}
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
