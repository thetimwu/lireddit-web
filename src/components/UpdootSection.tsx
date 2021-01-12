import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
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
            value: 1,
            postId: post.id,
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
            value: -1,
            postId: post.id,
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
