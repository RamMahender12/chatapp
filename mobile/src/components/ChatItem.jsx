import { View, Text, Image, TouchableOpacity } from "react-native";
import { format } from "timeago.js";
import { Feather } from "@expo/vector-icons";

function getChatName(chat, userId) {
  if (chat.isGroup) return chat.groupName;
  const other = chat.participants?.find((p) => p._id !== userId);
  return other?.name || "Unknown";
}

function getChatAvatar(chat, userId) {
  if (chat.isGroup) return chat.groupAvatar;
  const other = chat.participants?.find((p) => p._id !== userId);
  return other?.avatar || "";
}

function getLastMessagePreview(chat) {
  if (!chat.lastMessage) return "No messages yet";
  const m = chat.lastMessage;
  if (m.isDeleted) return "This message was deleted";
  if (m.messageType === "image") return "📷 Photo";
  if (m.messageType === "video") return "🎥 Video";
  if (m.messageType === "sticker") return m.stickerId || "🙂 Sticker";
  return m.content || "";
}

function isUserOnline(chat, userId) {
  const other = chat.participants?.find((p) => p._id !== userId);
  return other?.isOnline || false;
}

export default function ChatItem({ chat, userId, unreadCount, onPress }) {
  const name = getChatName(chat, userId);
  const avatar = getChatAvatar(chat, userId);
  const preview = getLastMessagePreview(chat);
  const online = isUserOnline(chat, userId);
  const time = chat.lastMessageAt ? format(chat.lastMessageAt) : "";

  return (
    <TouchableOpacity
      onPress={() => onPress(chat)}
      className="flex-row items-center px-4 py-3 active:bg-white/[0.04]"
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View className="relative">
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-dark-700 items-center justify-center">
            <Feather name="user" size={20} color="#71717a" />
          </View>
        )}
        {!chat.isGroup && online && (
          <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-success border-2 border-dark-950" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-dark-50 font-semibold text-base flex-1" numberOfLines={1}>
            {name}
          </Text>
          {time ? (
            <Text className="text-dark-400 text-xs ml-2">{time}</Text>
          ) : null}
        </View>
        <View className="flex-row items-center mt-0.5">
          {chat.isGroup && (
            <Feather name="users" size={12} color="#52525b" className="mr-1" />
          )}
          <Text
            className={`flex-1 text-sm ${unreadCount > 0 ? "text-dark-200 font-medium" : "text-dark-400"}`}
            numberOfLines={1}
          >
            {preview}
          </Text>
          {unreadCount > 0 && (
            <View className="ml-2 bg-accent-primary rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
              <Text className="text-white text-xs font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
