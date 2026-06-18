import { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import axios from "axios";

import { useAuth } from "../context/AuthContext";

export default function ForwardDialog({ visible, message, onClose, onForward }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) {
      fetchChats();
      setSearch("");
    }
  }, [visible]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/chats");
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = search
    ? chats.filter((chat) => {
        const name = chat.isGroup
          ? chat.groupName
          : chat.participants?.find((p) => p._id !== user?._id)?.name || "";
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : chats;

  const getChatName = (chat) => {
    if (chat.isGroup) return chat.groupName;
    const other = chat.participants?.find((p) => p._id !== user?._id);
    return other?.name || "Unknown";
  };

  const renderChat = ({ item }) => (
    <TouchableOpacity
      onPress={() => onForward(item._id)}
      className="flex-row items-center px-4 py-3"
    >
      <View className="w-10 h-10 rounded-full bg-dark-700 items-center justify-center">
        <Feather name={item.isGroup ? "users" : "user"} size={18} color="#71717a" />
      </View>
      <Text className="ml-3 text-base text-dark-50 flex-1" numberOfLines={1}>
        {getChatName(item)}
      </Text>
      <Feather name="chevron-forward" size={18} color="#52525b" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-dark-950">
        <View className="flex-row items-center px-4 py-3 border-b border-white/[0.04] bg-dark-900">
          <TouchableOpacity onPress={onClose} className="mr-3">
            <Feather name="arrow-left" size={24} color="#a1a1aa" />
          </TouchableOpacity>
          <Text className="text-dark-50 font-semibold text-base flex-1">Forward Message</Text>
        </View>

        {message && (
          <View className="px-4 py-3 bg-dark-800/60 border-b border-white/[0.04]">
            <Text className="text-dark-400 text-xs mb-1">Forwarding:</Text>
            <Text className="text-dark-200 text-sm" numberOfLines={2}>
              {message.content || (message.messageType === "image" ? "📷 Photo" : message.messageType === "sticker" ? "🙂 Sticker" : "")}
            </Text>
          </View>
        )}

        <View className="px-4 py-2 border-b border-white/[0.04]">
          <TextInput
            className="bg-dark-800 rounded-lg px-4 py-2 text-base text-dark-50"
            placeholder="Search chats..."
            placeholderTextColor="#52525b"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            renderItem={renderChat}
            ListEmptyComponent={
              <View className="items-center mt-20">
                <Feather name="message-square" size={48} color="#3f3f46" />
                <Text className="text-dark-400 text-base mt-4">No chats found</Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}
