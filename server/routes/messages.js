import express from "express";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { chatId, content, messageType, mediaUrl, stickerId, fileName, replyTo } = req.body;

    const messageData = {
      chat: chatId,
      sender: req.user._id,
      content: content || "",
      messageType: messageType || "text",
      readBy: [req.user._id],
    };

    if (mediaUrl) messageData.mediaUrl = mediaUrl;
    if (stickerId) messageData.stickerId = stickerId;
    if (fileName) messageData.fileName = fileName;
    if (replyTo) messageData.replyTo = replyTo;

    const message = await Message.create(messageData);

    let populatedMessage = await Message.findById(message._id)
      .populate("sender", "name avatar")
      .populate("replyTo")
      .populate("chat");

    populatedMessage = await Message.populate(populatedMessage, {
      path: "chat.participants",
      select: "name avatar email",
    });

    if (populatedMessage.replyTo) {
      populatedMessage = await Message.populate(populatedMessage, {
        path: "replyTo.sender",
        select: "name avatar",
      });
    }

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:chatId", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chat: req.params.chatId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name avatar email")
      .populate({ path: "replyTo", populate: { path: "sender", select: "name avatar" } })
      .populate("reactions.user", "name avatar")
      .populate("chat");

    // Reverse so the oldest message in the batch is first in the array
    const reversedMessages = messages.reverse();

    const totalMessages = await Message.countDocuments({ chat: req.params.chatId, isDeleted: false });
    const hasMore = skip + messages.length < totalMessages;

    res.json({
      messages: reversedMessages,
      page,
      hasMore,
      totalMessages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// React to a message
router.post("/:messageId/react", protect, async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: "Emoji is required" });

    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const existingIndex = message.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ user: req.user._id, emoji });
    }

    const saved = await message.save();
    const populated = await Message.populate(saved, {
      path: "reactions.user",
      select: "name avatar",
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pinned messages for a chat
router.get("/pinned/:chatId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
      pinned: true,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name avatar email")
      .populate({ path: "replyTo", populate: { path: "sender", select: "name avatar" } });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get starred messages for a chat (for current user)
router.get("/starred/:chatId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
      starredBy: { $in: [req.user._id] },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name avatar email")
      .populate({ path: "replyTo", populate: { path: "sender", select: "name avatar" } });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle pin
router.post("/:messageId/pin", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.pinned = !message.pinned;
    message.pinnedBy = message.pinned ? req.user._id : null;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle star
router.post("/:messageId/star", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const userIdStr = req.user._id.toString();
    const idx = message.starredBy.findIndex((id) => id.toString() === userIdStr);

    if (idx > -1) {
      message.starredBy.splice(idx, 1);
    } else {
      message.starredBy.push(req.user._id);
    }

    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete message (soft delete)
router.delete("/:messageId", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.isDeleted = true;
    await message.save();

    // Send updated message to chat for UI update
    const populated = await Message.findById(message._id)
      .populate("sender", "name avatar")
      .populate({ path: "replyTo", populate: { path: "sender", select: "name avatar" } });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forward message
router.post("/:messageId/forward", protect, async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ message: "chatId is required" });

    const original = await Message.findById(req.params.messageId);
    if (!original) return res.status(404).json({ message: "Message not found" });

    const newMessage = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content: original.content,
      messageType: original.messageType,
      mediaUrl: original.mediaUrl,
      stickerId: original.stickerId,
      fileName: original.fileName,
      readBy: [req.user._id],
    });

    let populated = await Message.findById(newMessage._id)
      .populate("sender", "name avatar")
      .populate("chat");

    populated = await Message.populate(populated, {
      path: "chat.participants",
      select: "name avatar email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: newMessage._id,
      lastMessageAt: newMessage.createdAt,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
