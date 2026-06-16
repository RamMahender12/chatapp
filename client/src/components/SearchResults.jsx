import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { format } from "timeago.js";
import {
  FiMessageCircle,
  FiUser,
  FiSearch,
  FiLoader,
  FiImage,
  FiVideo,
  FiSmile,
} from "react-icons/fi";

const highlightMatch = (text, query) => {
  if (!text || !query) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isMatch = part.toLowerCase() === query.toLowerCase();
    return isMatch ? (
      <span key={i} className="text-accent-primary font-semibold bg-accent-primary/10 px-0.5 rounded">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    );
  });
};

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16"
  >
    <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-accent-primary/50" />
    </div>
    <p className="text-dark-400 text-sm font-medium">{title}</p>
    {subtitle && <p className="text-dark-500 text-xs mt-1 text-center px-6">{subtitle}</p>}
  </motion.div>
);

const UserItem = ({ user, query, onClick }) => (
  <motion.button
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.05)" }}
    whileTap={{ scale: 0.99 }}
    onClick={() => onClick(user)}
    className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all text-left border border-transparent hover:border-accent-primary/10"
  >
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-dark-500 to-dark-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      {user.name?.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-dark-50 text-sm font-semibold truncate">
        {highlightMatch(user.name, query)}
      </h4>
      <p className="text-dark-400 text-xs truncate">{highlightMatch(user.email, query)}</p>
    </div>
    <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
      <FiMessageCircle className="w-4 h-4" />
    </div>
  </motion.button>
);

const ChatResultItem = ({ chat, query, currentUserId, onClick }) => {
  const otherUser = chat.participants?.find((p) => p._id !== currentUserId);

  const getLastMessage = () => {
    if (!chat.lastMessage) return "Start a conversation";
    const msg = chat.lastMessage;
    switch (msg.messageType) {
      case "image":
        return "📷 Photo";
      case "video":
        return "🎥 Video";
      case "sticker":
        return "🙂 Sticker";
      default:
        return msg.content || "";
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.05)" }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(chat)}
      className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all text-left border border-transparent hover:border-accent-primary/10"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {otherUser?.name?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-dark-50 text-sm font-semibold truncate">
            {highlightMatch(otherUser?.name, query)}
          </h4>
          {chat.lastMessageAt && (
            <span className="text-dark-500 text-[10px] flex-shrink-0 ml-2">
              {format(chat.lastMessageAt)}
            </span>
          )}
        </div>
        <p className="text-dark-400 text-xs truncate">{getLastMessage()}</p>
      </div>
    </motion.button>
  );
};

const MessageResultItem = ({ message, query, currentUserId, onChatClick }) => {
  const otherUser = message.chat?.participants?.find((p) => p._id !== currentUserId);
  const sender = message.sender;

  const getMessageIcon = () => {
    switch (message.messageType) {
      case "image":
        return <FiImage className="w-3.5 h-3.5" />;
      case "video":
        return <FiVideo className="w-3.5 h-3.5" />;
      case "sticker":
        return <FiSmile className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.05)" }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onChatClick(message.chat)}
      className="w-full flex items-start gap-3.5 px-3 py-3 rounded-2xl transition-all text-left border border-transparent hover:border-accent-primary/10"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dark-500 to-dark-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">
        {sender?.name?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-dark-50 text-sm font-semibold truncate">
            {highlightMatch(otherUser?.name || sender?.name, query)}
          </h4>
          <span className="text-dark-500 text-[10px] flex-shrink-0 ml-2">
            {format(message.createdAt)}
          </span>
        </div>
        <p className="text-dark-200 text-xs leading-relaxed line-clamp-2">
          {message.messageType === "text" ? (
            highlightMatch(message.content, query)
          ) : (
            <span className="flex items-center gap-1.5 text-dark-400">
              {getMessageIcon()}
              {message.messageType === "sticker" ? "Sticker" : `${message.messageType}`}
            </span>
          )}
        </p>
        <p className="text-dark-500 text-[10px] mt-1">
          {sender?._id === currentUserId ? "You" : sender?.name}
        </p>
      </div>
    </motion.button>
  );
};

const SearchResults = ({
  mode,
  query,
  results,
  loading,
  onChatSelect,
  onUserSelect,
}) => {
  const { user } = useAuth();

  if (!query.trim()) {
    return (
      <EmptyState
        icon={FiSearch}
        title="Start searching"
        subtitle={`Type to search ${mode === "global" ? "chats, users & messages" : mode}`}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-accent-primary/20 border-t-accent-primary rounded-full"
        />
        <p className="text-dark-400 text-xs mt-3">Searching...</p>
      </div>
    );
  }

  if (mode === "chats") {
    const chats = results.chats || [];
    if (chats.length === 0) {
      return (
        <EmptyState
          icon={FiMessageCircle}
          title="No chats found"
          subtitle={`No conversations match "${query}"`}
        />
      );
    }
    return (
      <div className="py-2">
        <p className="px-3 mb-2 text-dark-500 text-xs font-medium uppercase tracking-wide">
          {chats.length} chat{chats.length !== 1 ? "s" : ""} found
        </p>
        {chats.map((chat) => (
          <ChatResultItem
            key={chat._id}
            chat={chat}
            query={query}
            currentUserId={user?._id}
            onClick={onChatSelect}
          />
        ))}
      </div>
    );
  }

  if (mode === "users") {
    const users = results.users || [];
    if (users.length === 0) {
      return (
        <EmptyState
          icon={FiUser}
          title="No users found"
          subtitle={`No users match "${query}"`}
        />
      );
    }
    return (
      <div className="py-2">
        <p className="px-3 mb-2 text-dark-500 text-xs font-medium uppercase tracking-wide">
          {users.length} user{users.length !== 1 ? "s" : ""} found
        </p>
        {users.map((u) => (
          <UserItem key={u._id} user={u} query={query} onClick={onUserSelect} />
        ))}
      </div>
    );
  }

  // Global mode
  const { chats = [], users = [], messages = [] } = results;
  const hasAnyResults = chats.length > 0 || users.length > 0 || messages.length > 0;

  if (!hasAnyResults) {
    return (
      <EmptyState
        icon={FiSearch}
        title="No results found"
        subtitle={`Nothing matches "${query}" across chats, users, or messages`}
      />
    );
  }

  return (
    <div className="py-2 space-y-5">
      {chats.length > 0 && (
        <div>
          <p className="px-3 mb-2 text-dark-500 text-xs font-medium uppercase tracking-wide">
            Chats
          </p>
          {chats.map((chat) => (
            <ChatResultItem
              key={chat._id}
              chat={chat}
              query={query}
              currentUserId={user?._id}
              onClick={onChatSelect}
            />
          ))}
        </div>
      )}

      {users.length > 0 && (
        <div>
          <p className="px-3 mb-2 text-dark-500 text-xs font-medium uppercase tracking-wide">
            Users
          </p>
          {users.map((u) => (
            <UserItem key={u._id} user={u} query={query} onClick={onUserSelect} />
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div>
          <p className="px-3 mb-2 text-dark-500 text-xs font-medium uppercase tracking-wide">
            Messages
          </p>
          {messages.map((message) => (
            <MessageResultItem
              key={message._id}
              message={message}
              query={query}
              currentUserId={user?._id}
              onChatClick={onChatSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
