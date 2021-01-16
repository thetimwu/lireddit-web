import { Box, Heading } from "@chakra-ui/react";
import React from "react";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import Layout from "../../components/Layout";
import { useMeQuery } from "../../generated/graphql";
import useGetPostFromUrl from "../../utils/useGetPostFromUrl";
import { withApollo } from "../../utils/withApollo";

const Post: React.FC = ({}) => {
  const { data, error, loading } = useGetPostFromUrl();
  const { data: meData } = useMeQuery();

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>
      <Box mb={4}>{data.post.text}</Box>
      {meData?.me?.id === data.post.creator.id && (
        <EditDeletePostButtons id={data.post.id} />
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
