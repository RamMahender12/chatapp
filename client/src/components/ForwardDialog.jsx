import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSearch, FiCheck } from "react-icons/fi";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

const ForwardDialog = ({ message, onClose }) => {
  const { chats, forwardMessage } = useChat();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sending, setSending] = useState(false);

  const filtered = (chats || []).filter((chat) => {
    if (chat._id === (typeof message.chat === "object" ? message.chat?._id : message.chat)) return false;
    const name = chat.isGroup
      ? chat.groupName
      : chat.participants?.find((p) => p._id !== user?._id)?.name || "Unknown";
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  const handleForward = async () => {
    if (!selectedChatId || sending) return;
    setSending(true);
    await forwardMessage(message._id, selectedChatId);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-dark-800 border border-white/[0.04] rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
          <h3 className="text-dark-50 font-semibold text-sm">Forward message</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-white/[0.05] transition-colors"
          >
            <FiX className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="relative px-4 py-2">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-dark-900/60 text-dark-50 rounded-xl py-2 pl-10 pr-3 text-sm outline-none border border-white/[0.04] focus:border-accent-primary/30 transition-all placeholder:text-dark-500"
          />
        </div>

        <div className="max-h-64 overflow-y-auto px-2 py-1">
          {filtered.length === 0 ? (
            <p className="text-center text-dark-500 text-sm py-6">No chats found</p>
          ) : (
            filtered.map((chat) => {
              const name = chat.isGroup
                ? chat.groupName
                : chat.participants?.find((p) => p._id !== user?._id)?.name || "Unknown";
              const avatar = chat.isGroup
                ? null
                : chat.participants?.find((p) => p._id !== user?._id)?.avatar;
              return (
                <motion.button
                  key={chat._id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  onClick={() => setSelectedChatId(chat._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    selectedChatId === chat._id ? "bg-accent-primary/10" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-dark-50 text-sm flex-1 text-left truncate">{name}</span>
                  {selectedChatId === chat._id && (
                    <FiCheck className="w-4 h-4 text-accent-primary flex-shrink-0" />
                  )}
                </motion.button>
              );
            })
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/[0.04] flex justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-dark-300 text-sm hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleForward}
            disabled={!selectedChatId || sending}
            className={`px-4 py-2 rounded-xl text-white text-sm font-medium transition-all ${
              selectedChatId && !sending
                ? "bg-gradient-to-r from-accent-primary to-accent-secondary shadow-glow-sm"
                : "bg-dark-700 text-dark-400 cursor-not-allowed"
            }`}
          >
            {sending ? "Forwarding..." : "Forward"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ForwardDialog;
