import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import ChatItem from "./ChatItem";
import SearchUsers from "./SearchUsers";
import CreateGroup from "./CreateGroup";
import ProfileModal from "./ProfileModal";
import SearchResults from "./SearchResults";
import {
  FiSearch,
  FiMoreHorizontal,
  FiEdit,
  FiLogOut,
  FiUser,
  FiSettings,
  FiMessageCircle,
  FiX,
  FiUsers,
} from "react-icons/fi";

const SEARCH_TABS = [
  { id: "chats", label: "Chats" },
  { id: "users", label: "Users" },
  { id: "global", label: "Global" },
];

const Sidebar = ({ onSelectChat }) => {
  const {
    chats,
    fetchChats,
    selectedChat,
    searchQuery,
    searchMode,
    searchResults,
    searchLoading,
    performSearch,
    clearSearch,
    accessChat,
    fetchMessages,
    setSelectedChat,
  } = useChat();
  const { user, logout } = useAuth();
  const [localSearch, setLocalSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!isSearching) {
      clearSearch();
      setLocalSearch("");
    }
  }, [isSearching, clearSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    performSearch(value, searchMode);
  };

  const handleTabChange = (mode) => {
    performSearch(localSearch, mode);
  };

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
    onSelectChat();
    setIsSearching(false);
    clearSearch();
    setLocalSearch("");
  };

  const handleUserSelect = async (u) => {
    const chat = await accessChat(u._id);
    if (chat) {
      setSelectedChat(chat);
      fetchMessages(chat._id);
      onSelectChat();
      setIsSearching(false);
      clearSearch();
      setLocalSearch("");
    }
  };

  const filteredChats = chats.filter((chat) => {
    if (!localSearch || isSearching) return true;
    if (chat.isGroup) {
      return chat.groupName?.toLowerCase().includes(localSearch.toLowerCase());
    }
    const otherUser = chat.participants?.find((p) => p._id !== user?._id);
    return otherUser?.name?.toLowerCase().includes(localSearch.toLowerCase());
  });

  return (
    <div className="w-full h-full flex flex-col bg-dark-800/90 glass-strong">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-sm shadow-glow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-dark-900" />
          </div>
          <div className="hidden sm:block">
            <p className="text-dark-50 font-semibold text-sm group-hover:text-accent-primary transition-colors">
              {user?.name}
            </p>
            <p className="text-dark-400 text-xs">Online</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(139,92,246,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewChat(true)}
            className="p-2.5 rounded-xl text-dark-300 hover:text-accent-primary transition-all"
            title="New Chat"
          >
            <FiEdit className="w-[18px] h-[18px]" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(139,92,246,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateGroup(true)}
            className="p-2.5 rounded-xl text-dark-300 hover:text-accent-primary transition-all"
            title="New Group"
          >
            <FiUsers className="w-[18px] h-[18px]" />
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(139,92,246,0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2.5 rounded-xl text-dark-300 hover:text-accent-primary transition-all"
            >
              <FiMoreHorizontal className="w-[18px] h-[18px]" />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute right-0 top-12 glass rounded-2xl shadow-2xl z-50 w-52 py-2 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setShowProfile(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-dark-100 hover:bg-white/[0.05] flex items-center gap-3 transition-colors text-sm"
                    >
                      <FiUser className="w-4 h-4 text-dark-300" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-dark-100 hover:bg-white/[0.05] flex items-center gap-3 transition-colors text-sm"
                    >
                      <FiSettings className="w-4 h-4 text-dark-300" />
                      Settings
                    </button>
                    <div className="mx-3 my-1 h-px bg-white/[0.06]" />
                    <button
                      onClick={() => {
                        logout();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-danger hover:bg-danger/10 flex items-center gap-3 transition-colors text-sm"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="px-4 py-3"
      >
        <div className="relative group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4 group-focus-within:text-accent-primary transition-colors" />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            onFocus={() => setIsSearching(true)}
            onBlur={() => {
              // Delay to allow clicks on results
              setTimeout(() => {
                if (!localSearch.trim()) setIsSearching(false);
              }, 200);
            }}
            placeholder={
              isSearching
                ? `Search ${searchMode}...`
                : "Search conversations..."
            }
            className="w-full bg-dark-800/60 text-dark-50 rounded-xl py-2.5 pl-11 pr-10 text-sm outline-none border border-white/[0.04] focus:border-accent-primary/30 focus:bg-dark-800/80 transition-all placeholder:text-dark-500"
          />
          {localSearch && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                setLocalSearch("");
                clearSearch();
                setIsSearching(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/[0.05] text-dark-400"
            >
              <FiX className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>

        {/* Search mode tabs */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 mt-3 overflow-x-auto"
            >
              {SEARCH_TABS.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    searchMode === tab.id
                      ? "bg-accent-primary/15 text-accent-primary border border-accent-primary/20"
                      : "text-dark-300 hover:text-dark-100 hover:bg-white/[0.05] border border-transparent"
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 relative">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <SearchResults
              key="search-results"
              mode={searchMode}
              query={localSearch}
              results={searchResults}
              loading={searchLoading}
              onChatSelect={handleChatSelect}
              onUserSelect={handleUserSelect}
            />
          ) : (
            <motion.div
              key="chat-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <ChatItem
                    chat={chat}
                    isSelected={selectedChat?._id === chat._id}
                    onClick={() => onSelectChat()}
                  />
                </motion.div>
              ))}

              {filteredChats.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center mb-4"
                  >
                    <FiMessageCircle className="w-8 h-8 text-accent-primary/50" />
                  </motion.div>
                  <p className="text-dark-400 text-sm font-medium">No conversations yet</p>
                  <p className="text-dark-500 text-xs mt-1">
                    Start a new chat to get going
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowNewChat(true)}
                    className="mt-4 px-5 py-2 rounded-xl bg-accent-primary/10 text-accent-primary text-sm font-medium hover:bg-accent-primary/20 transition-colors"
                  >
                    Start chatting
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <SearchUsers onClose={() => setShowNewChat(false)} />
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateGroup && (
          <CreateGroup onClose={() => setShowCreateGroup(false)} />
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <ProfileModal onClose={() => setShowProfile(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;
