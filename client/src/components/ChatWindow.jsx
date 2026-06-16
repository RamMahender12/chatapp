import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useChat } from "../context/ChatContext";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "./EmojiPicker";
import StickerPicker from "./StickerPicker";
import AttachmentMenu from "./AttachmentMenu";
import MessagesPanel from "./MessagesPanel";
import { playOutgoingSound } from "../utils/notification";
import {
  FiArrowLeft,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiSend,
  FiSmile,
  FiPaperclip,
  FiMic,
  FiImage,
  FiHeart,
  FiUsers,
  FiX,
  FiCornerUpRight,
  FiMapPin,
  FiStar,
} from "react-icons/fi";

const ChatWindow = ({ onBack }) => {
  const {
    selectedChat,
    messages,
    loadingMessages,
    loadingMore,
    hasMoreMessages,
    loadMoreMessages,
    sendMessage,
    typingUsers,
    addMessage,
    reactToMessage,
    togglePin,
    toggleStar,
    deleteMessage,
  } = useChat();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'emoji' | 'stickers' | null
  const [showAttachment, setShowAttachment] = useState(false);
  const [showOverlay, setShowOverlay] = useState(null); // 'pinned' | 'starred' | null
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const initialScrollDoneRef = useRef(false);
  const scrollHeightBeforeLoadRef = useRef(0);

  const otherUser = selectedChat?.participants?.find(
    (p) => p._id !== user?._id
  );

  // Join/leave chat room for real-time messages
  useEffect(() => {
    if (!socket || !selectedChat?._id) return;

    socket.emit("join-chat", selectedChat._id);

    return () => {
      socket.emit("leave-chat", selectedChat._id);
    };
  }, [socket, selectedChat?._id]);

  // Scroll to bottom on initial load and when sending new messages
  useEffect(() => {
    if (!messagesContainerRef.current) return;

    if (!initialScrollDoneRef.current) {
      // First time loading messages - scroll to bottom
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      initialScrollDoneRef.current = true;
    } else if (!loadingMore && scrollHeightBeforeLoadRef.current === 0) {
      // New message added (not loading older) - scroll to bottom smoothly
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loadingMore]);

  // Preserve scroll position after loading older messages
  useEffect(() => {
    if (!messagesContainerRef.current) return;

    if (!loadingMore && scrollHeightBeforeLoadRef.current > 0) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const heightDiff = newScrollHeight - scrollHeightBeforeLoadRef.current;
      messagesContainerRef.current.scrollTop = heightDiff;
      scrollHeightBeforeLoadRef.current = 0;
    }
  }, [loadingMore, messages]);

  // Reset initial scroll flag when chat changes
  useEffect(() => {
    initialScrollDoneRef.current = false;
    scrollHeightBeforeLoadRef.current = 0;
  }, [selectedChat?._id]);

  const handleScroll = async () => {
    const container = messagesContainerRef.current;
    if (!container || loadingMore || !hasMoreMessages) return;

    // Load more when user scrolls near the top (within 100px)
    if (container.scrollTop < 100) {
      scrollHeightBeforeLoadRef.current = container.scrollHeight;
      await loadMoreMessages(selectedChat._id);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { chatId: selectedChat._id, userId: user._id });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { chatId: selectedChat._id, userId: user._id });
      setIsTyping(false);
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msgContent = message;
    const replyToId = replyTo?._id;
    setMessage("");
    setReplyTo(null);

    if (socket) {
      socket.emit("stop-typing", { chatId: selectedChat._id, userId: user._id });
    }

    const newMessage = await sendMessage(selectedChat._id, msgContent, { replyTo: replyToId });
    if (newMessage) {
      playOutgoingSound();
      if (socket) {
        socket.emit("new-message", newMessage);
      }
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  const handleStickerSelect = async (sticker) => {
    setActivePanel(null);
    setReplyTo(null);

    const msgData = {
      chatId: selectedChat._id,
      content: "",
      messageType: "sticker",
      stickerId: sticker.emoji,
      ...(replyTo?._id && { replyTo: replyTo._id }),
    };

    try {
      const { data } = await axios.post("/api/messages", msgData);
      if (data) {
        // Add to local state for sender
        addMessage(data);
        // Emit to other participants
        if (socket) socket.emit("new-message", data);
      }
    } catch (error) {
      console.error("Send sticker error:", error);
    }
  };

  const handleMediaSend = async (msgData) => {
    const dataWithReply = { ...msgData };
    if (replyTo?._id) dataWithReply.replyTo = replyTo._id;
    setReplyTo(null);
    try {
      const { data } = await axios.post("/api/messages", dataWithReply);
      if (data) {
        addMessage(data);
        if (socket) socket.emit("new-message", data);
      }
    } catch (error) {
      console.error("Send media error:", error);
    }
  };

  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    // Focus the input field
    setTimeout(() => {
      document.querySelector('input[type="text"]')?.focus();
    }, 50);
  };

  const getReplyPreviewText = (msg) => {
    if (!msg) return "";
    if (msg.content) return msg.content;
    if (msg.messageType === "image") return "📷 Photo";
    if (msg.messageType === "video") return "🎥 Video";
    if (msg.messageType === "sticker") return msg.stickerId || "🙂 Sticker";
    return "";
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-dark-950 relative"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 chat-wallpaper pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-4 py-3 glass border-b border-white/[0.04]"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="md:hidden p-2 rounded-xl hover:bg-white/[0.05] text-dark-300 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </motion.button>

          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm ${
                selectedChat?.isGroup
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                  : "bg-gradient-to-br from-accent-primary to-accent-secondary"
              }`}>
                {selectedChat?.isGroup ? (
                  <FiUsers className="w-5 h-5" />
                ) : (
                  otherUser?.name?.charAt(0).toUpperCase()
                )}
              </div>
              {!selectedChat?.isGroup && otherUser?.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-dark-900" />
              )}
            </div>

            <div>
              <h3 className="text-dark-50 font-semibold text-sm">
                {selectedChat?.isGroup ? selectedChat.groupName : otherUser?.name}
              </h3>
              <AnimatePresence mode="wait">
                {typingUsers[selectedChat?._id] ? (
                  <motion.p
                    key="typing"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-accent-primary text-xs font-medium"
                  >
                    typing...
                  </motion.p>
                ) : (
                  <motion.p
                    key="status"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-dark-400 text-xs"
                  >
                    {selectedChat?.isGroup
                      ? `${selectedChat.participants?.length || 0} members`
                      : otherUser?.isOnline
                        ? "Active now"
                        : "Offline"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-1">
          {[
            { icon: FiPhone, label: "Call" },
            { icon: FiVideo, label: "Video" },
          ].map(({ icon: Icon, label }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(139,92,246,0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl text-dark-300 hover:text-accent-primary transition-all"
              title={label}
            >
              <Icon className="w-[18px] h-[18px]" />
            </motion.button>
          ))}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(139,92,246,0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHeaderMenu(!showHeaderMenu)}
              className="p-2.5 rounded-xl text-dark-300 hover:text-accent-primary transition-all"
              title="More"
            >
              <FiMoreVertical className="w-[18px] h-[18px]" />
            </motion.button>
            <AnimatePresence>
              {showHeaderMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowHeaderMenu(false)}
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
                        setShowOverlay("pinned");
                        setShowHeaderMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-dark-100 hover:bg-white/[0.05] flex items-center gap-3 transition-colors text-sm"
                    >
                      <FiMapPin className="w-4 h-4 text-accent-primary" />
                      Pinned messages
                    </button>
                    <button
                      onClick={() => {
                        setShowOverlay("starred");
                        setShowHeaderMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-dark-100 hover:bg-white/[0.05] flex items-center gap-3 transition-colors text-sm"
                    >
                      <FiStar className="w-4 h-4 text-amber-400" />
                      Starred messages
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col">
        {loadingMessages ? (
          <div className="flex items-center justify-center flex-1">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-accent-primary/20 border-t-accent-primary rounded-full"
            />
          </div>
        ) : (
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="overflow-y-auto px-4 py-4 space-y-1"
            style={{ marginTop: 'auto' }}
          >
            {/* Loading older messages indicator */}
            <div className="flex justify-center py-3 min-h-[32px]">
              {loadingMore && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-dark-400 text-xs"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-accent-primary/20 border-t-accent-primary rounded-full"
                  />
                  Loading older messages...
                </motion.div>
              )}
            </div>

            {messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center my-4"
              >
                <div className="px-4 py-1.5 rounded-full bg-dark-800/60 border border-white/[0.04]">
                  <span className="text-dark-400 text-[11px] font-medium">Today</span>
                </div>
              </motion.div>
            )}

            {messages.filter((msg) => msg && msg.sender).map((msg, index, arr) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.sender?._id === user?._id || msg.sender === user?._id}
                isGroup={selectedChat?.isGroup}
                index={index}
                totalMessages={arr.length}
                onReply={handleReply}
                user={user}
                onReact={reactToMessage}
                onPin={togglePin}
                onStar={toggleStar}
                onDelete={deleteMessage}
              />
            ))}

            <AnimatePresence>
              {typingUsers[selectedChat?._id] && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="flex items-end gap-2"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {selectedChat?.isGroup ? "..." : otherUser?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-dark-800/60 border border-white/[0.04] rounded-2xl rounded-bl-md px-4 py-3">
                    <motion.div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                          className="w-2 h-2 bg-accent-primary/60 rounded-full"
                        />
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Panels */}
      <div className="relative z-10">
        <AnimatePresence>
          {activePanel === "emoji" && (
            <EmojiPicker
              key="emoji"
              onSelect={handleEmojiSelect}
              onClose={() => setActivePanel(null)}
            />
          )}
          {activePanel === "stickers" && (
            <StickerPicker
              key="stickers"
              onSelect={handleStickerSelect}
              onClose={() => setActivePanel(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 glass border-t border-white/[0.04] px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => togglePanel("emoji")}
              className={`p-2 rounded-xl transition-colors ${activePanel === "emoji"
                ? "text-accent-primary bg-accent-primary/10"
                : "text-dark-400 hover:text-dark-200 hover:bg-white/[0.05]"
                }`}
            >
              <FiSmile className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => togglePanel("stickers")}
              className={`p-2 rounded-xl transition-colors ${activePanel === "stickers"
                ? "text-accent-primary bg-accent-primary/10"
                : "text-dark-400 hover:text-dark-200 hover:bg-white/[0.05]"
                }`}
            >
              <FiHeart className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAttachment(true)}
              className="p-2 rounded-xl text-dark-400 hover:text-dark-200 hover:bg-white/[0.05] transition-colors"
            >
              <FiPaperclip className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <AnimatePresence>
              {replyTo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex items-center gap-3 px-3 py-1.5 bg-dark-800/60 border border-white/[0.04] rounded-t-xl mb-0.5 overflow-hidden"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <FiCornerUpRight className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                      <span className="text-[11px] font-semibold text-accent-primary">
                        {replyTo.sender?.name || "Unknown"}
                      </span>
                    </div>
                    <p className="text-[12px] text-dark-400 truncate">
                      {getReplyPreviewText(replyTo)}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setReplyTo(null)}
                    className="p-1 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-white/[0.05] transition-colors flex-shrink-0"
                  >
                    <FiX className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
              type="text"
              value={message}
              onChange={handleTyping}
              placeholder="Write a message..."
              className="flex-1 bg-dark-800/40 text-dark-50 rounded-xl py-3 px-4 outline-none text-sm border border-white/[0.04] focus:border-accent-primary/30 transition-all placeholder:text-dark-500"
            />

            <AnimatePresence mode="wait">
              {message.trim() ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="p-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-glow-sm"
                >
                  <FiSend className="w-5 h-5" />
                </motion.button>
              ) : (
                <motion.button
                  key="mic"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="p-3 rounded-xl text-dark-400 hover:text-dark-200 hover:bg-white/[0.05] transition-colors"
                >
                  <FiMic className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </form>
          </div>
        </div>
      </motion.div>

      {/* Attachment Menu */}
      <AnimatePresence>
        {showAttachment && (
          <AttachmentMenu
            chatId={selectedChat._id}
            onSend={handleMediaSend}
            onClose={() => setShowAttachment(false)}
          />
        )}
      </AnimatePresence>

      {/* Pinned / Starred Messages Panel */}
      <AnimatePresence>
        {showOverlay && (
          <MessagesPanel
            type={showOverlay}
            onClose={() => setShowOverlay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWindow;
