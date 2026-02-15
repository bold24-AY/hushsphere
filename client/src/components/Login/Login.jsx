import {
  VStack,
  ButtonGroup,
  Button,
  Heading,
  Text,
  CircularProgress,
  Flex,
  useColorModeValue,
  Box,
} from "@chakra-ui/react";
import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import TextField from "../TextField";
import { AccountContext } from "../AccountContext";

const Login = () => {
  const { setUser } = useContext(AccountContext);
  const [error, setError] = useState(null);
  const [loading, setloading] = useState(false);
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
        setloading(true);
        const vals = { ...values };
        fetch(`${process.env.REACT_APP_SERVER_URL}/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "Application/json",
          },
          body: JSON.stringify(vals),
        })
          .catch((err) => {
            setError(err.message || "An error occurred");
            console.log("error ==> ", err);
            setloading(false);
            setTimeout(() => {
              setError("");
            }, 3000);
            return;
          })
          .then((res) => res.json())
          .then((data) => {
            setloading(false);
            if (!data) return;

            setUser({ ...data });
            if (data.status) {
              setError(data.status);
            } else if (data.loggedIn) {
              setloading(false);
              navigate("/home");
            }
          })
          .catch((error) => {
            setloading(false);
            console.error("Error:", error);
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
              <Heading size="2xl" color="brand.500" mb="4">HushSphere</Heading>
              <Heading size="lg" color={headingColor}>Welcome Back</Heading>
              <Text fontSize="md" color="slate.500">
                Log in to continue your conversations
              </Text>
            </VStack>

            <Text color="red.500" h="6">{error}</Text>

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
                {loading ? (
                  <CircularProgress
                    isIndeterminate
                    color="white"
                    size="24px"
                  />
                ) : (
                  "Login"
                )}
              </Button>
            </ButtonGroup>

            <Button variant="link" colorScheme="slate" onClick={() => navigate("/register")} size="sm" color="slate.500">
              Don't have an account? Sign up
            </Button>
          </VStack>
        </Flex>
      )}
    </Formik>
  );
};
export default Login;

// initialValues={{ username: "", password: "" }}
// validationSchema={Yup.object({
//   username: Yup.string()
//     .required("Username required !")
//     .min(6, "Username too short !")
//     .max(28, "Username too long"),
//   password: Yup.string()
//     .required("Password required !")
//     .min(6, "Password too short !")
//     .max(28, "Password too long"),
// })}
// onSubmit={(values, actions) => {
//   const vals = { ...values };
//   fetch("http://localhost:4000/auth/login", {
//     method: "POST",
//     credentials: "include",
//     headers: {
//       "Content-Type": "Application/json",
//     },
//     body: JSON.stringify(vals),
//   })
//     .catch((err) => {
//       console.log(err);
//       return;
//     })
//     .then((res) => res.json())
//     .then((data) => {
//       console.log(data);
//       if (!data) return;

//       setUser({ ...data });
//       if (data.status) {
//         setError(data.status);
//       } else if (data.loggedIn) {
//         navigate("/home");
//       }
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });

//   actions.resetForm();
// }}
// >
// {(formik) => (

// )}
