import { Text, VStack, Box, useColorModeValue } from "@chakra-ui/react";
import { TabPanel, TabPanels } from "@chakra-ui/tabs";
import { useContext, useEffect, useRef } from "react";
import ChatBox from "./ChatBox";
import { FriendContext, MessagesContext } from "./Home";

const Chat = ({ userid }) => {
  const { friendList } = useContext(FriendContext);
  const { messages } = useContext(MessagesContext);
  const bottomDiv = useRef(null);

  const bg = useColorModeValue("slate.50", "slate.900");
  const myMsgBg = "brand.500";
  const myMsgColor = "white";
  const friendMsgBg = useColorModeValue("white", "slate.700");
  const friendMsgColor = useColorModeValue("slate.800", "white");
  const scrollbarThumb = useColorModeValue("slate.300", "slate.600");

  useEffect(() => {
    bottomDiv.current?.scrollIntoView();
  });

  return friendList.length > 0 ? (
    <VStack h="100%" justify="end" bg={bg} spacing={0}>
      <TabPanels overflowY="auto" flex="1" w="100%"
        css={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: scrollbarThumb,
            borderRadius: "24px",
          },
        }}
      >
        {friendList.map((friend) => (
          <VStack
            flexDir="column-reverse"
            as={TabPanel}
            key={`chat:${friend.username}`}
            w="100%"
            minH="100%"
            p="4"
          >
            <div ref={bottomDiv} />
            {messages
              .filter(
                (msg) => msg.to === friend.userid || msg.from === friend.userid
              )
              .map((message, idx) => (
                <Box
                  m={
                    message.to === friend.userid
                      ? "0.5rem 0 0 auto !important"
                      : "0.5rem auto 0 0 !important"
                  }
                  maxW="70%"
                  key={`msg:${friend.username}.${idx}`}
                  bg={message.to === friend.userid ? myMsgBg : friendMsgBg}
                  color={message.to === friend.userid ? myMsgColor : friendMsgColor}
                  borderRadius={message.to === friend.userid ? "2xl 2xl 0 2xl" : "2xl 2xl 2xl 0"}
                  p="0.75rem 1.25rem"
                  boxShadow="sm"
                  fontSize="md"
                >
                  <Text>{message.content}</Text>
                </Box>
              ))}
          </VStack>
        ))}
      </TabPanels>
      <ChatBox userid={userid} />
    </VStack>
  ) : (
    <VStack
      justifyContent="center"
      w="100%"
      h="100%"
      textAlign="center"
      bg={bg}
    >
      <Text fontSize="xl" color="slate.500">No Friend Selected</Text>
      <Text color="slate.400">Click add friend to start chatting</Text>
    </VStack>
  );
};
export default Chat;
