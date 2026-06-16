import { motion } from "framer-motion";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { format } from "timeago.js";
import { FiUsers } from "react-icons/fi";

const ChatItem = ({ chat, isSelected, onClick }) => {
  const { setSelectedChat, fetchMessages, unreadCounts } = useChat();
  const { user } = useAuth();

  const otherUser = chat.participants?.find((p) => p._id !== user?._id);
  const unread = unreadCounts[chat._id] || 0;

  const handleClick = () => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
    onClick();
  };

  const getLastMessage = () => {
    if (!chat.lastMessage) return "Start a conversation";
    const msg = chat.lastMessage;
    const isSender = msg.sender === user?._id || msg.sender?._id === user?._id;
    const senderName = chat.isGroup && !isSender ? `${msg.sender?.name || "Someone"}: ` : "";
    const prefix = isSender ? "You: " : senderName;

    switch (msg.messageType) {
      case "image":
        return `${prefix}📷 Photo`;
      case "video":
        return `${prefix}🎥 Video`;
      case "sticker":
        return `${prefix}🙂 Sticker`;
      default:
        return `${prefix}${msg.content || ""}`;
    }
  };

  const displayName = chat.isGroup ? chat.groupName : otherUser?.name;
  const displayInitial = chat.isGroup
    ? chat.groupName?.charAt(0).toUpperCase()
    : otherUser?.name?.charAt(0).toUpperCase();

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.05)" }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className={`flex items-center gap-3.5 px-3 py-3 mx-1 cursor-pointer rounded-2xl transition-all duration-200 mb-0.5 ${
        isSelected
          ? "bg-accent-primary/[0.08] border border-accent-primary/10"
          : "border border-transparent"
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm ${
            chat.isGroup
              ? "bg-gradient-to-br from-emerald-500 to-teal-600"
              : isSelected
                ? "bg-gradient-to-br from-accent-primary to-accent-secondary shadow-glow-sm"
                : "bg-gradient-to-br from-dark-500 to-dark-600"
          }`}
        >
          {chat.isGroup ? <FiUsers className="w-5 h-5" /> : displayInitial}
        </motion.div>
        {!chat.isGroup && otherUser?.isOnline && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-dark-900"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3
            className={`font-semibold text-sm truncate ${
              isSelected ? "text-accent-primary" : "text-dark-50"
            }`}
          >
            {displayName}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className="text-dark-500 text-[11px]">
              {chat.lastMessageAt ? format(chat.lastMessageAt) : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-dark-400 text-xs truncate leading-relaxed flex-1 min-w-0">
            {getLastMessage()}
          </p>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 px-1.5 min-w-[20px] h-5 rounded-full bg-accent-primary flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatItem;
