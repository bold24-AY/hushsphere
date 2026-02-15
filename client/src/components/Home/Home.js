import React, { createContext, useState } from "react";
import { Grid, GridItem, Tabs, useColorModeValue } from "@chakra-ui/react";
import SideBar from "./SideBar";
import Chat from "./Chat";
import useSocketSetup from "./useSocketSetup";

export const FriendContext = createContext();
export const MessagesContext = createContext();
const Home = () => {
  const [friendList, setfriendList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [friendindex, setFriendIndex] = useState(0);
  useSocketSetup(setfriendList, setMessages);

  const borderColor = useColorModeValue("slate.200", "slate.700");

  return (
    <FriendContext.Provider value={{ friendList, setfriendList }}>
      <Grid
        templateColumns="repeat(10,1fr)"
        h="100vh"
        as={Tabs}
        onChange={(index) => setFriendIndex(index)}
      >
        <GridItem colSpan={{ base: "10", md: "3" }} borderRight="1px solid" borderColor={borderColor}>
          <SideBar />
        </GridItem>
        <GridItem colSpan={{ base: "0", md: "7" }} maxH="100vh" display={{ base: "none", md: "block" }}>
          <MessagesContext.Provider value={{ messages, setMessages }}>
            <Chat userid={friendList[friendindex]?.userid} />
          </MessagesContext.Provider>
        </GridItem>
      </Grid>
    </FriendContext.Provider>
  );
};

export default Home;
