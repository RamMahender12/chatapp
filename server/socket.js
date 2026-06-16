import User from "./models/User.js";
import Chat from "./models/Chat.js";

let onlineUsers = new Map();

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("setup", async (userId) => {
      if (!userId) return;
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        io.emit("user-online", userId);
      } catch (err) {
        console.error("Setup error:", err.message);
      }
    });

    socket.on("join-chat", (chatId) => {
      if (chatId) socket.join(chatId);
    });

    socket.on("leave-chat", (chatId) => {
      if (chatId) socket.leave(chatId);
    });

    socket.on("new-message", async (message) => {
      try {
        // If chat is just an ID, populate it to get participants
        let chatData = message.chat;
        if (typeof chatData === "string" || !chatData?.participants) {
          const chat = await Chat.findById(typeof chatData === "string" ? chatData : chatData._id)
            .populate("participants", "_id");
          if (!chat) return;
          chatData = chat;
        }

        const participants = chatData.participants;
        if (!participants || !Array.isArray(participants)) return;

        participants.forEach((participant) => {
          const participantId = participant._id?.toString() || participant.toString();
          const senderId = typeof message.sender === "object"
            ? message.sender._id?.toString()
            : message.sender?.toString();

          if (participantId === senderId) return;
          socket.to(participantId).emit("message-received", message);
        });
      } catch (err) {
        console.error("new-message error:", err.message);
      }
    });

    socket.on("typing", ({ chatId, userId }) => {
      if (chatId) socket.to(chatId).emit("typing", { chatId, userId });
    });

    socket.on("stop-typing", ({ chatId, userId }) => {
      if (chatId) socket.to(chatId).emit("stop-typing", { chatId, userId });
    });

    socket.on("disconnect", async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        try {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
          io.emit("user-offline", socket.userId);
        } catch (err) {
          console.error("Disconnect error:", err.message);
        }
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
