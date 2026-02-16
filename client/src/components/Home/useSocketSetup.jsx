import { useContext, useEffect } from "react";
import socket from "../../socket";
import { AccountContext } from "../AccountContext";

const useSocketSetup = (setfriendList, setMessages) => {
  const { setUser } = useContext(AccountContext);
  useEffect(() => {
    socket.connect();
    socket.on("friends", (friendList) => {
      console.log(friendList);
      setfriendList(friendList);
    });

    socket.on("connected", (status, username) => {
      setfriendList((prevFriends) => {
        return [...prevFriends].map((friend) => {
          if (friend.username === username) {
            friend.connected = status;
          }
          return friend;
        });
      });
    });
    socket.on("messages", (messages) => {
      setMessages(messages);
    });
    socket.on("dm", (message) => {
      console.log("DM Event Fired!", message);
      setMessages((prevMsg) => [...prevMsg, message]);
    });
    socket.on("friend_removed", (removedUsername) => {
      setfriendList((prevFriends) =>
        prevFriends.filter(friend => friend.username !== removedUsername)
      );
    });
    socket.on("connect_error", () => {
      console.log("connection fail");
      setUser({ loggedIn: false });
    });
    return () => {
      socket.off("connect_error");
      socket.off("connected");
      socket.off("friends");
      socket.off("messages");
      socket.off("dm");
      socket.off("friend_removed");
    };
  }, [setUser, setfriendList]);
};

export default useSocketSetup;
