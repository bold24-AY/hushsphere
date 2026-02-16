import {
  VStack,
  ButtonGroup,
  Button,
  Heading,
  Text,
  Flex,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import TextField from "../TextField";
import { useNavigate } from "react-router";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useContext, useState } from "react";
import { AccountContext } from "../AccountContext";
import l2 from "../../assets/l2.svg";
import ToggleColorMode from "../ToggleColorMode";

const Signup = () => {
  const { setUser } = useContext(AccountContext);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const bg = useColorModeValue("white", "slate.800");
  const borderColor = useColorModeValue("slate.200", "slate.700");
  const headingColor = useColorModeValue("slate.800", "white");
  const brandColor = "brand.500";

  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      validationSchema={Yup.object({
        username: Yup.string()
          .required("Username required !")
          .min(4, "Username too short !")
          .max(28, "Username too long"),
        password: Yup.string()
          .required("Password required !")
          .min(6, "Password too short !")
          .max(28, "Password too long"),
      })}
      onSubmit={(values, actions) => {
        const vals = { ...values };
        fetch(`${process.env.REACT_APP_SERVER_URL}/auth/singup`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "Application/json",
          },
          body: JSON.stringify(vals),
        })
          .catch((err) => {
            console.log(err);
            return;
          })
          .then((res) => {
            if (!res || !res.ok || res.status >= 400) return;
            return res.json;
          })
          .then((data) => {
            if (!data) return;
            setUser({ ...data });
            if (data.status) {
              setError(data.status);
            } else if (data.loggedIn) {
              navigate("/home");
            }
          });
        actions.resetForm();
      }}
    >
      {(formik) => (
        <Flex
          minH="100vh"
          justify="center"
          align="center"
          px="4"
        >
          <ToggleColorMode />
          <VStack
            as={Form}
            w="full"
            maxW="md"
            bg={bg}
            p="8"
            borderRadius="xl"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
            spacing="6"
            onSubmit={formik.handleSubmit}
          >
            <VStack spacing="2" align="center" w="full">
              <Image src={l2} alt="HushSphere Logo" maxW="250px" mb="4" borderRadius="md" />
              <Heading size="lg" color={headingColor}>Create Account</Heading>
              <Text fontSize="md" color="slate.500">
                Join the conversation today
              </Text>
            </VStack>

            <Text as="p" color="red.500" h="6">
              {error}
            </Text>

            <VStack spacing="4" w="full">
              <TextField
                name="username"
                placeholder="Enter username"
                autoComplete="off"
                label="Username"
              />
              <TextField
                name="password"
                placeholder="Enter password"
                autoComplete="off"
                label="Password"
                type="password"
              />
            </VStack>

            <ButtonGroup w="full" spacing="4">
              <Button
                type="submit"
                bg={brandColor}
                color="white"
                _hover={{ bg: "brand.600" }}
                w="full"
                h="12"
              >
                Create Account
              </Button>
            </ButtonGroup>

            <Button
              variant="link"
              colorScheme="slate"
              onClick={() => navigate("/")}
              leftIcon={<ArrowBackIcon />}
              size="sm"
              color="slate.500"
            >
              Back to Login
            </Button>
          </VStack>
        </Flex>
      )}
    </Formik>
  );
};
export default Signup;
