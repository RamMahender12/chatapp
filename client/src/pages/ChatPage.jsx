import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../context/ChatContext";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import EmptyChat from "../components/EmptyChat";
import {
  playIncomingSound,
  sendNotification,
  requestNotificationPermission,
} from "../utils/notification";

const ChatPage = () => {
  const { selectedChat, addMessage, setTyping, clearTyping } = useChat();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [isMobileShowChat, setIsMobileShowChat] = useState(false);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      addMessage(message);

      if (message.sender?._id !== user?._id && message.sender !== user?._id) {
        playIncomingSound();
        const senderName = message.sender?.name || "Someone";
        const body = message.content || (message.messageType === "sticker" ? "Sent a sticker" : "Sent a media");
        sendNotification(senderName, body);
      }
    };

    const handleTyping = ({ chatId }) => {
      setTyping(chatId, true);
    };

    const handleStopTyping = ({ chatId }) => {
      clearTyping(chatId);
    };

    socket.on("message-received", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("message-received", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [socket, user, addMessage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex bg-dark-950 relative overflow-hidden min-w-0 min-h-0"
    >
      {/* Sidebar */}
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`${
          isMobileShowChat ? "hidden md:flex" : "flex"
        } w-full md:w-[380px] lg:w-[420px] flex-shrink-0 border-r border-white/[0.04]`}
      >
        <Sidebar onSelectChat={() => setIsMobileShowChat(true)} />
      </motion.div>

      {/* Chat area */}
      <div
        className={`${
          isMobileShowChat ? "flex" : "hidden md:flex"
        } flex-1 h-full min-w-0 min-h-0 overflow-hidden flex flex-col`}
      >
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <ChatWindow
              key={selectedChat._id}
              onBack={() => setIsMobileShowChat(false)}
            />
          ) : (
            <EmptyChat key="empty" />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChatPage;
