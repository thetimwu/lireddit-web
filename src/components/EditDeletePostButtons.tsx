import { EditIcon, CloseIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useDeletePostMutation } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
}) => {
  const [, deletePost] = useDeletePostMutation();
  return (
    <Box>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          mr={4}
          variant="outline"
          colorScheme="red"
          aria-label="Edit Post"
          fontSize="20px"
          icon={<EditIcon />}
        />
      </NextLink>
      <IconButton
        ml="auto"
        variant="outline"
        colorScheme="red"
        aria-label="Delete Post"
        fontSize="20px"
        icon={<CloseIcon />}
        onClick={() => {
          deletePost({ id });
        }}
      />
    </Box>
  );
};

export default EditDeletePostButtons;
