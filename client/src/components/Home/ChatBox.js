import React, { useContext } from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Button, Input, HStack, useColorModeValue } from "@chakra-ui/react";
import socket from "../../socket";
import { MessagesContext } from "./Home";

const ChatBox = ({ userid }) => {
  const { setMessages } = useContext(MessagesContext);
  const bg = useColorModeValue("white", "slate.800");
  const borderColor = useColorModeValue("slate.200", "slate.700");

  return (
    <Formik
      initialValues={{ message: "" }}
      validationSchema={Yup.object({
        message: Yup.string().min(1).max(255),
      })}
      onSubmit={(value, action) => {
        const message = { to: userid, from: null, content: value.message };
        socket.emit("dm", message);
        setMessages((prevMsg) => [message, ...prevMsg]);
        action.resetForm();
      }}
    >
      <HStack
        as={Form}
        w="100%"
        p="4"
        bg={bg}
        borderTop="1px solid"
        borderColor={borderColor}
        spacing="4"
      >
        <Input
          as={Field}
          name="message"
          placeholder="Type message here..."
          size="lg"
          autoComplete="off"
          borderRadius="full"
          focusBorderColor="brand.500"
        />
        <Button
          type="submit"
          size="lg"
          bg="brand.500"
          color="white"
          borderRadius="full"
          px="8"
          _hover={{ bg: "brand.600" }}
        >
          Send
        </Button>
      </HStack>
    </Formik>
  );
};
export default ChatBox;
