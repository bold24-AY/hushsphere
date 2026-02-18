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
      // console.log("DM Event Fired!", message);
      setMessages((prevMsg) => [...prevMsg, message]);

      // If the sender is not in our friend list, add them temporarily so we can chat
      setfriendList((prevFriends) => {
        const isKnown = prevFriends.some(f => f.userid === message.from);
        if (!isKnown && message.from && message.from_username) {
          return [...prevFriends, {
            userid: message.from,
            username: message.from_username,
            connected: true, // If they sent a message, they are likely online
            isFriend: false
          }];
        }
        return prevFriends;
      });
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
  }, [setUser, setfriendList, setMessages]);
};

export default useSocketSetup;
