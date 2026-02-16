import React, { useContext } from "react";
import { useDisclosure, useColorModeValue } from "@chakra-ui/react"; // Keeping for AddFriendModel for now
import { FriendContext } from "./Home";
import AddFriendModel from "./AddFriendModel";

const SideBar = () => {
  const { friendList, setFriendIndex } = useContext(FriendContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const sidebarBg = useColorModeValue("bg-white border-r border-gray-200", "glass border-r border-white/5");
  const textColor = useColorModeValue("text-gray-800", "text-white");
  const subTextColor = useColorModeValue("text-gray-500", "text-slate-500");
  const hoverBg = useColorModeValue("hover:bg-gray-100", "hover:bg-white/5");

  // Hoisted hooks for inputs and buttons
  const inputStyles = useColorModeValue("bg-gray-100 text-gray-800 placeholder:text-gray-400 border border-gray-200", "glass-input text-slate-200 placeholder:text-slate-600");
  const filterBtnStyles = useColorModeValue("bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 hover:text-gray-700", "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200");

  // Hoisted hooks for friend list items
  const friendAvatarConnected = "bg-gradient-to-br from-slate-700 to-surface text-white";
  const friendAvatarDisconnected = useColorModeValue("bg-gray-200 text-gray-400 border-gray-300", "bg-surface text-slate-400 border-white/5");
  const friendHoverBorder = useColorModeValue("group-hover:border-gray-300", "group-hover:border-white/20");
  const friendStatusBorder = useColorModeValue("border-white", "border-surface");

  return (
    <>
      <aside className={`w-80 flex flex-col z-20 relative hidden md:flex h-full ${sidebarBg}`}>
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold tracking-tight ${textColor}`}>Messages</h2>
            <button onClick={onOpen} className="size-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-slate-400 hover:text-primary">
              <span className="material-symbols-outlined text-lg">edit_square</span>
            </button>
          </div>

          <div className="relative group mb-4">
            <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 ${subTextColor} group-focus-within:text-primary transition-colors text-xl`}>search</span>
            <input type="text" placeholder="Search encrypted chats..."
              className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner outline-none bg-transparent ${inputStyles}`} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            <button className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 whitespace-nowrap hover:bg-primary/20 transition-colors">All</button>
            <button className={`px-4 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${filterBtnStyles}`}>Unread</button>
            <button className={`px-4 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${filterBtnStyles}`}>Archived</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-4">
          {friendList.map((friend, idx) => (
            <div
              key={`friend:${friend.username}`}
              onClick={() => setFriendIndex(idx)}
              className={`group p-3 rounded-2xl border border-transparent cursor-pointer transition-all ${hoverBg} hover:border-white/5`}
            >
              <div className="flex gap-3">
                <div className="relative">
                  <div className={`size-12 rounded-full flex items-center justify-center border transition-colors ${friend.connected ? friendAvatarConnected : friendAvatarDisconnected} ${friendHoverBorder}`}>
                    <span className="material-symbols-outlined">{friend.connected ? "person" : "person_off"}</span>
                  </div>
                  <span className={`absolute bottom-0 right-0 size-3.5 border-2 rounded-full ${friend.connected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"} ${friendStatusBorder}`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-medium truncate transition-colors ${textColor} group-hover:text-primary`}>{friend.username}</h3>
                    <span className={`text-[11px] ${subTextColor}`}>Just now</span>
                  </div>
                  <p className={`text-xs truncate transition-colors ${subTextColor} group-hover:text-primary/70`}>Click to view secure messages</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
      <AddFriendModel isOpen={isOpen} onClose={onClose} />
    </>
  );
};
export default SideBar;
