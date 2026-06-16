import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Chat from "./models/Chat.js";
import Message from "./models/Message.js";

dotenv.config();

const EMAIL_TO_DELETE = "ram.mahender@gmail.com";

const deleteUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email: EMAIL_TO_DELETE });

    if (!user) {
      console.log(`User with email ${EMAIL_TO_DELETE} not found`);
      process.exit(0);
    }

    const userId = user._id;

    // Find all chats this user participates in
    const userChats = await Chat.find({ participants: userId });
    const chatIds = userChats.map((chat) => chat._id);

    // Delete messages from those chats
    const messagesResult = await Message.deleteMany({ chat: { $in: chatIds } });
    console.log(`Deleted ${messagesResult.deletedCount} message(s)`);

    // Delete user's chats
    const chatsResult = await Chat.deleteMany({ _id: { $in: chatIds } });
    console.log(`Deleted ${chatsResult.deletedCount} chat(s)`);

    // Delete user
    await User.deleteOne({ _id: userId });
    console.log(`Deleted user: ${EMAIL_TO_DELETE}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

deleteUser();
