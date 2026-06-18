import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "../components/MessageBubble";
import EmojiPicker from "../components/EmojiPicker";
import StickerPicker from "../components/StickerPicker";
import AttachmentMenu from "../components/AttachmentMenu";
import ForwardDialog from "../components/ForwardDialog";

export default function ChatScreen({ route, navigation }) {
  const { chatId } = route.params;
  const { user } = useAuth();
  const {
    selectedChat,
    setSelectedChat,
    messages,
    loadingMessages,
    loadingMore,
    hasMoreMessages,
    typingUsers,
    fetchMessages,
    loadMoreMessages,
    sendMessage,
    reactToMessage,
    deleteMessage,
    fetchChats,
    togglePin,
    toggleStar,
    pinnedMessages,
    fetchPinnedMessages,
    forwardMessage,
  } = useChat();
  const { socket } = useSocket();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);
  const flatListRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showForward, setShowForward] = useState(null);
  const [showPinnedPanel, setShowPinnedPanel] = useState(false);
  const [pinnedMessagesList, setPinnedMessagesList] = useState([]);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // Fetch chat details and messages
  useEffect(() => {
    const findChat = async () => {
      await fetchChats();
    };
    findChat();
    fetchMessages(chatId);
  }, [chatId]);

  // Find and set selected chat from chats list
  useEffect(() => {
    if (!selectedChat || selectedChat._id !== chatId) {
      const chat = { _id: chatId };
      setSelectedChat(chat);
    }
  }, [chatId]);

  // Socket: join room
  useEffect(() => {
    if (!socket || !chatId) return;
    socket.emit("join-chat", chatId);
    return () => {
      socket.emit("leave-chat", chatId);
    };
  }, [socket, chatId]);

  const chatName = route.params?.chatName || "Chat";

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    const extra = {};
    if (replyTo) {
      extra.replyTo = replyTo._id;
    }
    setReplyTo(null);
    await sendMessage(chatId, text, extra);
  }, [input, chatId, sendMessage, replyTo]);

  const handleTyping = useCallback(
    (text) => {
      setInput(text);
      if (!isTyping && socket) {
        setIsTyping(true);
        socket.emit("typing", { chatId, userId: user?._id });
      }
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        setIsTyping(false);
        socket?.emit("stop-typing", { chatId, userId: user?._id });
      }, 2000);
    },
    [chatId, user, socket, isTyping]
  );

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMoreMessages) {
      loadMoreMessages(chatId);
    }
  }, [loadingMore, hasMoreMessages, loadMoreMessages, chatId]);

  const handleEmojiSelect = useCallback((emoji) => {
    setInput((prev) => prev + emoji);
  }, []);

  const handleReply = useCallback((message) => {
    setReplyTo(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleForward = useCallback((message) => {
    setShowForward(message);
  }, []);

  const handlePinMessage = useCallback(async (messageId) => {
    await togglePin(messageId);
  }, [togglePin]);

  const handleStarMessage = useCallback(async (messageId) => {
    await toggleStar(messageId);
  }, [toggleStar]);

  const handleOpenPinned = useCallback(async () => {
    if (selectedChat?._id) {
      await fetchPinnedMessages(selectedChat._id);
      setPinnedMessagesList(pinnedMessages);
    }
    setShowPinnedPanel(true);
  }, [selectedChat, fetchPinnedMessages, pinnedMessages]);

  const handleViewInfo = useCallback(() => {
    // Future: chat info screen
  }, []);

  const handleStickerSelect = useCallback(async (sticker) => {
    await sendMessage(chatId, sticker.emoji, { messageType: "sticker", stickerId: sticker.emoji });
  }, [chatId, sendMessage]);

  const handleAttachmentSelect = useCallback(async (type) => {
    if (type === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera permission is required");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        await sendMessage(chatId, "", { messageType: "image", mediaUrl: result.assets[0].uri });
      }
    } else if (type === "gallery") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Gallery permission is required");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        await sendMessage(chatId, "", { messageType: "image", mediaUrl: result.assets[0].uri });
      }
    } else if (type === "document") {
      const result = await DocumentPicker.getDocumentAsync({});
      if (!result.canceled && result.assets?.[0]) {
        await sendMessage(chatId, result.assets[0].name || "Document", {
          messageType: "document",
          mediaUrl: result.assets[0].uri,
        });
      }
    } else if (type === "sticker") {
      setShowStickerPicker(true);
    }
  }, [chatId, sendMessage]);

  const isGroup = selectedChat?.isGroup || false;
  const otherParticipant = selectedChat?.participants?.find((p) => p._id !== user?._id);
  const isOnline = otherParticipant?.isOnline || false;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View className="flex-1 bg-dark-950">
        {/* Header */}
        <View
          className="flex-row items-center px-4 py-3 border-b border-white/[0.04]"
          style={{ paddingTop: insets.top + 8 }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Feather name="arrow-left" size={24} color="#a1a1aa" />
          </TouchableOpacity>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-dark-50 font-semibold text-base" numberOfLines={1}>
                {chatName}
              </Text>
              {!isGroup && isOnline && (
                <View className="w-2 h-2 rounded-full bg-success ml-2" />
              )}
            </View>
            {typingUsers[chatId] ? (
              <Text className="text-accent-primary text-xs">typing...</Text>
            ) : !isGroup && (
              <Text className="text-dark-500 text-xs">{isOnline ? "Active now" : "Offline"}</Text>
            )}
            {isGroup && selectedChat?.participants?.length && (
              <Text className="text-dark-500 text-xs">{selectedChat.participants.length} members</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => setShowHeaderMenu(true)}>
            <Feather name="more-vertical" size={22} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        {loadingMessages ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <MessageBubble
                message={item}
                isOwn={item.sender?._id === user?._id || item.sender === user?._id}
                isGroup={isGroup}
                index={index}
                totalMessages={messages.length}
                onReact={reactToMessage}
                onReply={handleReply}
                onDelete={deleteMessage}
                onForward={handleForward}
                onPin={handlePinMessage}
                onStar={handleStarMessage}
              />
            )}
            inverted={false}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              flexGrow: 1,
              justifyContent: messages.length === 0 ? "center" : undefined,
            }}
            ListEmptyComponent={
              <View className="items-center">
                <Text className="text-dark-400">No messages yet</Text>
                <Text className="text-dark-500 text-sm mt-1">
                  Send a message to start the conversation
                </Text>
              </View>
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingMore ? (
                <View className="py-2 items-center">
                  <ActivityIndicator size="small" color="#8b5cf6" />
                </View>
              ) : null
            }
          />
        )}

        {/* Reply preview bar */}
        {replyTo && (
          <View className="flex-row items-center px-4 py-2 bg-dark-800 border-t border-white/[0.04]">
            <View className="flex-1 mr-2">
              <Text className="text-accent-primary text-xs font-semibold">
                Replying to {replyTo.sender?.name || "Unknown"}
              </Text>
              <Text className="text-dark-400 text-xs" numberOfLines={1}>
                {replyTo.content || (replyTo.messageType === "image" ? "📷 Photo" : replyTo.messageType === "sticker" ? "🙂 Sticker" : "")}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancelReply} className="p-1">
              <Feather name="x" size={18} color="#52525b" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input bar */}
        <View
          className="flex-row items-center px-4 py-3 border-t border-white/[0.04] bg-dark-900"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <TouchableOpacity onPress={() => setShowAttachmentMenu(true)} className="mr-2">
            <Feather name="plus" size={22} color="#a1a1aa" />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-dark-800 rounded-xl border border-white/[0.06] px-3">
            <TextInput
              className="flex-1 text-dark-50 py-2.5 text-base max-h-20"
              placeholder="Message"
              placeholderTextColor="#52525b"
              value={input}
              onChangeText={handleTyping}
              multiline
            />
            <TouchableOpacity onPress={() => setShowEmojiPicker(true)} className="ml-2">
              <Feather name="smile" size={20} color="#52525b" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim()}
            className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
              input.trim() ? "bg-accent-primary" : "bg-dark-700"
            }`}
          >
            <Feather
              name="send"
              size={18}
              color={input.trim() ? "white" : "#52525b"}
            />
          </TouchableOpacity>
        </View>
        <EmojiPicker
          visible={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onSelect={handleEmojiSelect}
        />
        <StickerPicker
          visible={showStickerPicker}
          onClose={() => setShowStickerPicker(false)}
          onSelect={handleStickerSelect}
        />
        <AttachmentMenu
          visible={showAttachmentMenu}
          onClose={() => setShowAttachmentMenu(false)}
          onSelect={handleAttachmentSelect}
        />

        {/* Header menu modal */}
        <Modal
          visible={showHeaderMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowHeaderMenu(false)}
        >
          <Pressable
            className="flex-1 bg-black/50"
            onPress={() => setShowHeaderMenu(false)}
          >
            <Pressable className="absolute bottom-0 left-0 right-0 bg-dark-800 rounded-t-2xl p-4 pb-8">
              {[
                { icon: "pin", label: "Pinned Messages", action: handleOpenPinned },
                { icon: "info", label: "Chat Info", action: handleViewInfo },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => { setShowHeaderMenu(false); item.action(); }}
                  className="flex-row items-center py-3 px-2"
                >
                  <Feather name={item.icon} size={18} color="#a1a1aa" />
                  <Text className="ml-3 text-base text-dark-200">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </Pressable>
          </Pressable>
        </Modal>

        {/* Pinned messages panel */}
        <Modal
          visible={showPinnedPanel}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPinnedPanel(false)}
        >
          <View className="flex-1 bg-dark-950">
            <View className="flex-row items-center px-4 py-3 border-b border-white/[0.04] bg-dark-900">
              <TouchableOpacity onPress={() => setShowPinnedPanel(false)} className="mr-3">
                <Feather name="arrow-left" size={24} color="#a1a1aa" />
              </TouchableOpacity>
              <Text className="text-dark-50 font-semibold text-base">Pinned Messages</Text>
            </View>
            <FlatList
              data={pinnedMessagesList}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <MessageBubble
                  message={item}
                  isOwn={item.sender?._id === user?._id}
                  isGroup={isGroup}
                  onReact={reactToMessage}
                  onReply={handleReply}
                  onDelete={deleteMessage}
                  onForward={handleForward}
                  onPin={handlePinMessage}
                  onStar={handleStarMessage}
                />
              )}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center mt-20">
                  <Feather name="pin" size={48} color="#3f3f46" />
                  <Text className="text-dark-400 text-lg font-medium mt-4">No pinned messages</Text>
                </View>
              }
              contentContainerStyle={{ flexGrow: 1, padding: 12 }}
            />
          </View>
        </Modal>

        {/* Forward dialog */}
        <ForwardDialog
          visible={!!showForward}
          message={showForward}
          onClose={() => setShowForward(null)}
          onForward={(chatId) => {
            if (showForward) {
              forwardMessage(showForward._id, chatId);
            }
            setShowForward(null);
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
