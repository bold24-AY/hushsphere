import React, { useContext } from "react";
import { Button } from "@chakra-ui/button";
import { ChatIcon } from "@chakra-ui/icons";
import {
  VStack,
  HStack,
  Heading,
  Divider,
  Text,
  Circle,
  useColorModeValue,
} from "@chakra-ui/react";
import { Tab, TabList } from "@chakra-ui/tabs";
import { useDisclosure } from "@chakra-ui/react";
import { FriendContext } from "./Home";
import AddFriendModel from "./AddFriendModel";

const SideBar = () => {
  const { friendList } = useContext(FriendContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const borderColor = useColorModeValue("slate.200", "slate.700");
  const headingColor = useColorModeValue("slate.800", "white");
  const hoverBg = useColorModeValue("slate.100", "slate.700");
  const selectedBg = useColorModeValue("brand.50", "brand.900");

  return (
    <>
      <VStack py="1.4rem" spacing={4} h="100%">
        <HStack justify="space-between" w="100%" px="4">
          <Heading size="md" color={headingColor}>
            Add Friends
          </Heading>
          <Button onClick={onOpen} size="sm" variant="ghost">
            <ChatIcon />
          </Button>
        </HStack>
        <Divider borderColor={borderColor} />
        <VStack as={TabList} w="100%" spacing={0} border="none">
          {friendList.map((friend) => {
            return (
              <HStack
                as={Tab}
                key={`friend:${friend.username}`} // Fix key usage (was outside prop in original)
                w="100%"
                py="4"
                px="4"
                _selected={{ bg: selectedBg, borderLeft: "4px solid", borderColor: "brand.500" }}
                _hover={{ bg: hoverBg }}
                justifyContent="start"
                borderBottom="1px solid"
                borderColor={borderColor}
                transition="all 0.2s"
              >
                <Circle
                  bg={friend.connected ? "green.500" : "red.500"}
                  w="10px"
                  h="10px"
                  mr="3"
                />
                <Text fontSize="md" fontWeight="medium" color={headingColor}>
                  {friend.username}
                </Text>
              </HStack>
            );
          })}
        </VStack>
      </VStack>
      <AddFriendModel isOpen={isOpen} onClose={onClose} />
    </>
  );
};
export default SideBar;
