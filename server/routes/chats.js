import express from "express";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { userId } = req.body;

    const existingChat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate("participants", "-password");

    if (existingChat) {
      return res.json(existingChat);
    }

    const chat = await Chat.create({
      participants: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(chat._id).populate(
      "participants",
      "-password"
    );
    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search my chats by participant name or message content
router.get("/search", protect, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json([]);
    }

    const searchRegex = new RegExp(q, "i");

    // Find chats where other participant name matches OR group name matches
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ name: searchRegex }, { email: searchRegex }],
    }).select("_id");

    const userIds = users.map((u) => u._id);

    const chats = await Chat.find({
      participants: { $all: [req.user._id] },
      $or: [
        { participants: { $in: userIds } },
        { isGroup: true, groupName: searchRegex },
      ],
    })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Global search: messages across all chats + users + chat participants
router.get("/search/global", protect, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json({ chats: [], users: [], messages: [] });
    }

    const searchRegex = new RegExp(q, "i");

    // Find chats where participant name matches
    const matchedUsers = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ name: searchRegex }, { email: searchRegex }],
    }).select("_id name email avatar");

    const matchedUserIds = matchedUsers.map((u) => u._id);

    // My chats that match participant names
    const chats = await Chat.find({
      participants: { $all: [req.user._id], $in: matchedUserIds },
    })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 })
      .limit(10);

    // Messages containing the search query in chats where I participate
    const myChatIds = await Chat.find({ participants: req.user._id }).distinct("_id");

    const messages = await Message.find({
      chat: { $in: myChatIds },
      content: searchRegex,
      messageType: "text",
    })
      .populate("sender", "name avatar")
      .populate("chat", "participants")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      chats,
      users: matchedUsers,
      messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create group chat
router.post("/group", protect, async (req, res) => {
  try {
    const { groupName, users } = req.body;

    if (!groupName || !users || users.length < 2) {
      return res.status(400).json({ message: "Group name and at least 2 users required" });
    }

    const allParticipants = [req.user._id, ...users];

    const chat = await Chat.create({
      participants: allParticipants,
      isGroup: true,
      groupName,
      groupAdmin: req.user._id,
    });

    const fullChat = await Chat.findById(chat._id)
      .populate("participants", "-password");

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:chatId", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("participants", "-password")
      .populate("lastMessage");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
