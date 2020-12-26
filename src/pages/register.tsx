import React from "react";
import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
// import { useMutation } from "urql";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

interface registerProps {}

const register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();
  return (
    <Wrapper>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (value, { setErrors }) => {
          console.log(value);
          const response = await register(value);
          if (response.data.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data.register.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              label="Username"
              placeholder="User Name"
            />
            <Box mt={4}>
              <InputField
                name="password"
                label="Password"
                placeholder="password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default register;
