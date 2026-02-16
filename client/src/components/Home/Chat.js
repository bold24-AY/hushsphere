import React, { useContext, useEffect, useRef } from "react";
import ChatBox from "./ChatBox";
import { MessagesContext } from "./Home";
import { useColorModeValue } from "@chakra-ui/react";

const Chat = ({ friend }) => {
  const { messages } = useContext(MessagesContext);
  const bottomDiv = useRef(null);

  const headerBg = useColorModeValue("bg-white/80 border-b border-gray-200", "glass");
  const textColor = useColorModeValue("text-gray-800", "text-white");
  const iconColor = useColorModeValue("text-gray-500 hover:text-gray-800", "text-slate-400 hover:text-white");
  const receivedBubble = useColorModeValue("bg-gray-100 text-gray-800 border border-gray-200", "bg-white/5 text-slate-200 border border-white/10");

  // Hoisted hooks for empty state
  const emptyIconBg = useColorModeValue("bg-gray-100", "bg-white/5");
  const emptyText = useColorModeValue("text-gray-700", "text-slate-300");

  // Hoisted hooks for header avatar
  const avatarBg = useColorModeValue("bg-gray-200 text-gray-700 border-gray-300", "bg-gradient-to-br from-slate-700 to-slate-800 text-white border-white/10");
  const statusBorder = useColorModeValue("border-white", "border-surface");

  // Hoisted hooks for message bubbles
  const msgAvatarBg = useColorModeValue("bg-gray-100 border-gray-200", "bg-surface border-white/5");

  useEffect(() => {
    bottomDiv.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, friend]);

  if (!friend) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50 select-none">
        <div className={`size-32 rounded-3xl flex items-center justify-center mb-6 shadow-2xl skew-y-3 ${emptyIconBg}`}>
          <span className="material-symbols-outlined text-6xl text-slate-500">lock_clock</span>
        </div>
        <h3 className={`text-2xl font-bold mb-2 ${emptyText}`}>Select a secure channel</h3>
        <p className="max-w-xs text-slate-500">Choose a contact from the left sidebar to begin encrypted communication.</p>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <header className={`${headerBg} h-20 px-6 flex items-center justify-between z-10 sticky top-0 backdrop-blur-md`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`size-10 rounded-full flex items-center justify-center font-bold shadow-lg ${avatarBg}`}>
              <span className="material-symbols-outlined text-xl">person</span>
            </div>
            <span className={`absolute bottom-0 right-0 size-3 border-2 rounded-full ${friend.connected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"} ${statusBorder}`}></span>
          </div>
          <div>
            <h2 className={`text-lg font-bold tracking-tight flex items-center gap-2 ${textColor}`}>
              {friend.username}
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider border border-primary/20">Encrypted</span>
            </h2>
            <p className="text-xs text-primary font-medium flex items-center gap-1">
              {friend.connected ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className={`size-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors ${iconColor}`}>
            <span className="material-symbols-outlined">call</span>
          </button>
          <button className={`size-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors ${iconColor}`}>
            <span className="material-symbols-outlined">videocam</span>
          </button>
          <button className={`size-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors ${iconColor}`}>
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" id="chat-messages">
        {messages
          .filter(msg => msg.to === friend.userid || msg.from === friend.userid)
          .map((message, idx) => {
            const isMe = message.from === null;
            return (
              <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] group relative ${isMe ? "" : "flex gap-3"}`}>
                  {!isMe && (
                    <div className={`size-8 rounded-full border flex items-center justify-center self-end mb-1 ${msgAvatarBg}`}>
                      <span className="material-symbols-outlined text-xs text-slate-500">person</span>
                    </div>
                  )}
                  <div>
                    {!isMe && <span className="text-[10px] text-slate-500 ml-1 mb-1 block">{friend.username}</span>}
                    <div className={`
                                        p-4 rounded-3xl relative message-bubble backdrop-blur-sm
                                        ${isMe
                        ? "bg-primary text-dark rounded-br-none shadow-[0_0_15px_rgba(13,200,242,0.2)]"
                        : `${receivedBubble} rounded-bl-none`}
                                    `}>
                      <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                    </div>
                    <span className={`text-[10px] text-slate-500 mt-1 block ${isMe ? "text-right mr-1" : "ml-1"}`}>
                      12:42 PM
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        }
        {messages.filter(msg => msg.to === friend.userid || msg.from === friend.userid).length === 0 && (
          <div className="text-center py-10 opacity-30">
            <p>No messages yet. Start the conversation.</p>
          </div>
        )}
        <div ref={bottomDiv} />
      </div>

      {/* Input Area */}
      <ChatBox userid={friend.userid} />
    </>
  );
};

export default Chat;
