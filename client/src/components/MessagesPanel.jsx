import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FiX, FiMapPin, FiStar, FiClock } from "react-icons/fi";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const getPreviewText = (msg) => {
  if (msg.content) return msg.content;
  if (msg.messageType === "image") return "📷 Photo";
  if (msg.messageType === "video") return "🎥 Video";
  if (msg.messageType === "sticker") return msg.stickerId || "🙂 Sticker";
  if (msg.messageType === "file") return msg.fileName || "📎 File";
  return "";
};

const MessagesPanel = ({ type, onClose }) => {
  const { pinnedMessages, starredMessages, fetchPinnedMessages, fetchStarredMessages, selectedChat } = useChat();
  const { user } = useAuth();
  const scrollRef = useRef(null);
  const isPinned = type === "pinned";
  const messages = isPinned ? pinnedMessages : starredMessages;

  useEffect(() => {
    if (selectedChat?._id) {
      if (isPinned) {
        fetchPinnedMessages(selectedChat._id);
      } else {
        fetchStarredMessages(selectedChat._id);
      }
    }
  }, [selectedChat?._id, isPinned, fetchPinnedMessages, fetchStarredMessages]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="relative z-[10000] bg-dark-800 border border-white/[0.04] rounded-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
    >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPinned ? "bg-accent-primary/15" : "bg-amber-500/15"}`}>
              {isPinned ? (
                <FiMapPin className={`w-4 h-4 ${isPinned ? "text-accent-primary" : "text-amber-400"}`} />
              ) : (
                <FiStar className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="text-dark-50 font-semibold text-sm">
                {isPinned ? "Pinned Messages" : "Starred Messages"}
              </h3>
              <p className="text-dark-400 text-xs">
                {messages.length} {messages.length === 1 ? "message" : "messages"}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-white/[0.05] transition-colors"
          >
            <FiX className="w-5 h-5" />
          </motion.button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isPinned ? "bg-accent-primary/10" : "bg-amber-500/10"}`}>
                {isPinned ? (
                  <FiMapPin className={`w-6 h-6 ${isPinned ? "text-accent-primary/50" : "text-amber-500/50"}`} />
                ) : (
                  <FiStar className="w-6 h-6 text-amber-500/50" />
                )}
              </div>
              <p className="text-dark-400 text-sm font-medium">
                No {isPinned ? "pinned" : "starred"} messages yet
              </p>
              <p className="text-dark-500 text-xs mt-1">
                {isPinned
                  ? "Pin important messages to find them easily later"
                  : "Star your favorite messages to keep them handy"}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`px-4 py-3 rounded-xl ${
                    isOwn
                      ? "bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/10"
                      : "bg-dark-900/40 border border-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-[10px] font-bold">
                        {msg.sender?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <span className="text-dark-100 text-xs font-medium">
                        {isOwn ? "You" : msg.sender?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isPinned && <FiMapPin className="w-3 h-3 text-accent-primary/60" />}
                      {!isPinned && <FiStar className="w-3 h-3 text-amber-400/60" />}
                      <span className="text-dark-500 text-[10px] flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-dark-200 text-sm leading-relaxed line-clamp-3">
                    {getPreviewText(msg)}
                  </p>
                </motion.div>
              );
            })
          )}
        </div>
    </motion.div>
  );
};

export default MessagesPanel;
