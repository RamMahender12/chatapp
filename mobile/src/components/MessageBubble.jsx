import { useState, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Modal, Pressable, ScrollView } from "react-native";
import { ResizeMode, Video } from "expo-av";
import * as Clipboard from "expo-clipboard";
import { format } from "timeago.js";
import { Feather } from "@expo/vector-icons";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "🥺", "😡"];

const MORE_EMOJIS = [
  "👍", "❤️", "😂", "😮", "🥺", "😡", "🎉", "🔥", "💯", "✨",
  "🙏", "👏", "🤣", "😍", "🤔", "😭", "😤", "😎", "💀", "👀",
  "💪", "🤝", "🫡", "🫶", "🥳", "🤗",
];

export default function MessageBubble({
  message,
  isOwn,
  isGroup,
  onReact,
  onReply,
  onDelete,
  onForward,
  onPin,
  onStar,
}) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [reactionsExpanded, setReactionsExpanded] = useState(false);

  if (message.isDeleted) {
    return (
      <View className={`flex ${isOwn ? "items-end" : "items-start"} mb-1.5`}>
        <View className="px-3.5 py-2 rounded-2xl bg-dark-800/30 border border-white/[0.02]">
          <Text className="text-dark-500 text-xs italic">
            This message was deleted
          </Text>
        </View>
      </View>
    );
  }

  const renderReplyPreview = () => {
    if (!message.replyTo) return null;
    const replied = message.replyTo;
    let previewText = replied.content || "";
    if (!previewText) {
      if (replied.messageType === "image") previewText = "📷 Photo";
      else if (replied.messageType === "video") previewText = "🎥 Video";
      else if (replied.messageType === "sticker") previewText = replied.stickerId || "🙂 Sticker";
    }
    return (
      <View className={`mb-1.5 pl-2 border-l-2 ${isOwn ? "border-white/50" : "border-accent-primary"}`}>
        <Text className={`text-[10px] font-semibold ${isOwn ? "text-white/80" : "text-accent-primary"}`}>
          {replied.sender?.name || "Unknown"}
        </Text>
        <Text className={`text-[11px] ${isOwn ? "text-white/60" : "text-dark-400"}`} numberOfLines={1}>
          {previewText}
        </Text>
      </View>
    );
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;
    const grouped = {};
    message.reactions.forEach((r) => {
      if (!grouped[r.emoji]) grouped[r.emoji] = [];
      grouped[r.emoji].push(r.user?.name || "Unknown");
    });
    return (
      <View className={`flex-row flex-wrap gap-0.5 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
        {Object.entries(grouped).map(([emoji, users]) => (
          <View
            key={emoji}
            className="flex-row items-center px-1.5 py-0.5 rounded-full bg-dark-900/60 border border-white/[0.04]"
          >
            <Text className="text-xs">{emoji}</Text>
            {users.length > 1 && (
              <Text className="text-dark-400 text-[10px] ml-0.5">
                {users.length}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const bubbleStyle = isOwn
    ? "bg-accent-primary rounded-2xl rounded-br-md"
    : "bg-dark-800/60 border border-white/[0.04] rounded-2xl rounded-bl-md";

  const renderContent = () => {
    switch (message.messageType) {
      case "sticker":
        return (
          <View className="items-center">
            {renderReplyPreview()}
            <Text className="text-5xl">{message.stickerId}</Text>
            {message.content && (
              <Text className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-dark-400"}`}>
                {message.content}
              </Text>
            )}
            <Text className={`text-[9px] mt-1 ${isOwn ? "text-white/50" : "text-dark-500"}`}>
              {format(message.createdAt)}
            </Text>
            {renderReactions()}
          </View>
        );

      case "image":
        return (
          <View>
            {renderReplyPreview()}
            <TouchableOpacity onPress={() => setImageExpanded(true)}>
              <Image
                source={{ uri: message.mediaUrl }}
                className="w-60 h-48 rounded-xl"
                resizeMode="cover"
              />
            </TouchableOpacity>
            {message.content && (
              <Text className={`text-sm mt-1.5 ${isOwn ? "text-white" : "text-dark-50"}`}>
                {message.content}
              </Text>
            )}
            <Text className={`text-[9px] mt-1 ${isOwn ? "text-white/60" : "text-dark-500"}`}>
              {format(message.createdAt)}
            </Text>
            {renderReactions()}
          </View>
        );

      case "video":
        return (
          <View>
            {renderReplyPreview()}
            <View className="w-60 h-48 rounded-xl overflow-hidden bg-dark-900">
              <Video
                source={{ uri: message.mediaUrl }}
                className="w-full h-full"
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                shouldPlay={false}
              />
            </View>
            {message.content && (
              <Text className={`text-sm mt-1.5 ${isOwn ? "text-white" : "text-dark-50"}`}>
                {message.content}
              </Text>
            )}
            <Text className={`text-[9px] mt-1 ${isOwn ? "text-white/60" : "text-dark-500"}`}>
              {format(message.createdAt)}
            </Text>
            {renderReactions()}
          </View>
        );

      default:
        return (
          <View className="flex-col">
            {renderReplyPreview()}
            <Text
              className={`text-sm leading-5 ${isOwn ? "text-white" : "text-dark-50"}`}
            >
              {message.content}
            </Text>
            <View className="flex-row items-center justify-end gap-1 mt-1">
              <Text className={`text-[9px] ${isOwn ? "text-white/60" : "text-dark-500"}`}>
                {format(message.createdAt)}
              </Text>
              {isOwn && (
                <Feather name="check" size={12} color="rgba(255,255,255,0.6)" />
              )}
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                className="p-0.5"
              >
                <Feather
                  name="chevron-down"
                  size={12}
                  color={isOwn ? "rgba(255,255,255,0.6)" : "#52525b"}
                />
              </TouchableOpacity>
            </View>
            {renderReactions()}
          </View>
        );
    }
  };

  return (
    <>
      <View className={`flex ${isOwn ? "items-end" : "items-start"} mb-1.5`}>
        <View className={`max-w-[80%]`}>
          {/* Group sender name */}
          {isGroup && !isOwn && message.messageType !== "sticker" && (
            <Text className="text-accent-primary text-[10px] font-semibold mb-1 ml-1">
              {message.sender?.name}
            </Text>
          )}

          <View className="flex-row gap-2 mb-1">
            {message.pinned && <Text className="text-[9px] text-accent-primary">📌 Pinned</Text>}
            {message.starredBy?.length > 0 && <Text className="text-[9px] text-amber-400">⭐ Starred</Text>}
          </View>

          {message.messageType === "sticker" ? (
            <View className="bg-transparent">{renderContent()}</View>
          ) : (
            <View className={`px-3.5 py-2.5 ${bubbleStyle}`}>
              {renderContent()}
            </View>
          )}
        </View>
      </View>

      {/* Context menu modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setMenuVisible(false)}
        >
          <Pressable className="absolute bottom-0 left-0 right-0 bg-dark-800 rounded-t-2xl p-4 pb-8">
            {/* Quick reactions */}
            <View className="flex-row justify-around mb-4 pb-4 border-b border-white/[0.06]">
              {QUICK_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    onReact?.(message._id, emoji);
                    setMenuVisible(false);
                  }}
                  className="w-10 h-10 items-center justify-center"
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Menu items */}
            {[
              { icon: "corner-up-right", label: "Reply", action: () => onReply?.(message) },
              { icon: "copy", label: "Copy", action: () => Clipboard.setStringAsync(message.content || "") },
              { icon: "smile", label: "More Reactions", action: () => { setMenuVisible(false); setReactionsExpanded(true); } },
              { icon: "send", label: "Forward", action: () => onForward?.(message) },
              { icon: "pin", label: message.pinned ? "Unpin" : "Pin", action: () => onPin?.(message._id) },
              { icon: "star", label: message.starredBy?.length > 0 ? "Unstar" : "Star", action: () => onStar?.(message._id) },
              { icon: "trash-2", label: "Delete", action: () => onDelete?.(message._id), danger: true },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  item.action();
                  setMenuVisible(false);
                }}
                className={`flex-row items-center py-3 px-2 ${item.danger ? "" : ""}`}
              >
                <Feather
                  name={item.icon}
                  size={18}
                  color={item.danger ? "#ef4444" : "#a1a1aa"}
                />
                <Text
                  className={`ml-3 text-base ${item.danger ? "text-danger" : "text-dark-200"}`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Extended reactions modal */}
      <Modal
        visible={reactionsExpanded}
        transparent
        animationType="fade"
        onRequestClose={() => setReactionsExpanded(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setReactionsExpanded(false)}
        >
          <Pressable className="absolute bottom-0 left-0 right-0 bg-dark-800 rounded-t-2xl p-4 pb-8">
            <Text className="text-dark-200 text-base font-semibold mb-3 text-center">
              Choose Reaction
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {MORE_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    onReact?.(message._id, emoji);
                    setReactionsExpanded(false);
                  }}
                  className="w-11 h-11 items-center justify-center"
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Expanded image modal */}
      <Modal
        visible={imageExpanded}
        transparent
        animationType="fade"
        onRequestClose={() => setImageExpanded(false)}
      >
        <Pressable
          className="flex-1 bg-black/90 items-center justify-center"
          onPress={() => setImageExpanded(false)}
        >
          <TouchableOpacity
            onPress={() => setImageExpanded(false)}
            className="absolute top-12 right-4 z-10 p-3"
          >
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: message.mediaUrl }}
            className="w-full h-[80%]"
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </>
  );
}
