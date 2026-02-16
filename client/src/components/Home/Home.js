import React, { createContext, useState } from "react";
import SideBar from "./SideBar";
import Chat from "./Chat";
import useSocketSetup from "./useSocketSetup";
import InfoSidebar from "./InfoSidebar";
import l1 from "../../assets/l1.svg";
import ToggleColorMode from "../ToggleColorMode";

import { useColorModeValue } from "@chakra-ui/system";

export const FriendContext = createContext();
export const MessagesContext = createContext();

const Home = () => {
  const [friendList, setfriendList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [friendindex, setFriendIndex] = useState(0);
  useSocketSetup(setfriendList, setMessages);

  const bg = useColorModeValue("bg-gray-100", "bg-dark");
  const text = useColorModeValue("text-gray-800", "text-slate-300");

  return (
    <FriendContext.Provider value={{ friendList, setfriendList, friendindex, setFriendIndex }}>
      <div className={`flex h-screen w-full overflow-hidden ${bg} ${text} font-sans selection:bg-primary/30`} id="app-container">
        <div className="absolute top-0 right-0 m-2 z-50">
          <ToggleColorMode />
        </div>
        {/* Navigation Rail (Inline for now) */}
        <aside className="w-20 glass-heavy flex flex-col items-center py-8 z-30 transition-all duration-300 ease-in-out">
          <div className="mb-10 animate-float cursor-pointer">
            <div className="size-16 rounded-2xl flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(13,200,242,0.4)] hover:drop-shadow-[0_0_25px_rgba(13,200,242,0.6)] transition-all duration-300 group">
              <img src={l1} alt="HushSphere" className="w-full h-full object-contain group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-6 w-full px-3">
            <button className="sidebar-link active w-full aspect-square flex items-center justify-center rounded-xl bg-primary/10 text-primary shadow-[inset_3px_0_0_#0dc8f2] relative" title="Chats">
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>
            <button className="sidebar-link w-full aspect-square flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all duration-300 transform hover:translate-x-1" title="Contacts">
              <span className="material-symbols-outlined">group</span>
            </button>
          </nav>

          <div className="mt-auto flex flex-col gap-5 w-full px-3">
            <button className="w-full aspect-square flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-500">settings</span>
            </button>
          </div>
        </aside>

        <SideBar />

        <main className="flex-1 flex flex-col relative z-0 h-full overflow-hidden bg-dark/30 backdrop-blur-sm">
          <MessagesContext.Provider value={{ messages: messages, setMessages: setMessages }}>
            <Chat friend={friendList[friendindex]} />
          </MessagesContext.Provider>
        </main>

        <InfoSidebar />

      </div>
    </FriendContext.Provider>
  );
};

export default Home;
