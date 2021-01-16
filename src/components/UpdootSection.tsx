import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { gql } from "urql";
import {
  PostSnippetFragment,
  PostSnippetFragmentDoc,
  useVoteMutation,
  VoteMutation,
} from "../generated/graphql";
import { ApolloCache } from "@apollo/client";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null | object;
  }>({
    id: "Post:" + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });

  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints =
      (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
    cache.writeFragment({
      id: "Post:" + postId,
      fragment: gql`
        fragment _ on Post {
          points
          voteStatus
        }
      `,
      data: {
        id: PostSnippetFragmentDoc,
        points: newPoints,
        voteStatus: value,
      } as any,
    });
  }
};

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [vote] = useVoteMutation();
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      mr={4}
    >
      <IconButton
        onClick={async () => {
          if (post.points === 1) {
            return;
          }
          setLoadingState("updoot-loading");
          await vote({
            variables: { value: 1, postId: post.id },
          });
          setLoadingState("not-loading");
        }}
        aria-label="updoot post"
        name="chevron-up"
        size="24px"
        isLoading={loadingState === "updoot-loading"}
        colorScheme={post.points === 1 ? "teal" : undefined}
        icon={<ChevronUpIcon />}
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.points === -1) {
            return;
          }
          setLoadingState("downdoot-loading");
          await vote({
            variables: { value: -1, postId: post.id },
            update: (cache) => updateAfterVote(1, post.id, cache),
          });
          setLoadingState("not-loading");
        }}
        aria-label="downdoot post"
        name="chevron-down"
        size="24px"
        colorScheme={post.points === -1 ? "red" : undefined}
        isLoading={loadingState === "downdoot-loading"}
        icon={<ChevronDownIcon />}
      />
    </Flex>
  );
};

export default UpdootSection;
