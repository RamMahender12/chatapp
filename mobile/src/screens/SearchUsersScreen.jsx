import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useChat } from "../context/ChatContext";

const MODES = [
  { key: "chats", label: "Chats" },
  { key: "users", label: "Users" },
  { key: "global", label: "Global" },
];

export default function SearchUsersScreen() {
  const navigation = useNavigation();
  const { accessChat, searchResults, searchLoading, performSearch, clearSearch, fetchChats } = useChat();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeMode, setActiveMode] = useState("users");
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => clearSearch();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(query, activeMode);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeMode]);

  const handleSelectUser = async (userId) => {
    const chat = await accessChat(userId);
    if (chat) {
      navigation.goBack();
    }
  };

  const handleSelectChat = async (chat) => {
    navigation.navigate("Chat", { chatId: chat._id, chatName: chat.isGroup ? chat.groupName : "" });
  };

  const getCurrentResults = () => {
    switch (activeMode) {
      case "chats": return searchResults.chats || [];
      case "users": return searchResults.users || [];
      case "global": return searchResults.messages || [];
      default: return [];
    }
  };

  const renderResult = ({ item }) => {
    if (activeMode === "users") {
      return (
        <TouchableOpacity
          onPress={() => handleSelectUser(item._id)}
          className="flex-row items-center px-4 py-3"
        >
          <View className="w-12 h-12 rounded-full bg-dark-700 items-center justify-center">
            <Text className="text-dark-200 text-lg font-bold">
              {item.name?.charAt(0)?.toUpperCase()}
            </Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-dark-50">{item.name}</Text>
            {item.email && <Text className="text-sm text-dark-400">{item.email}</Text>}
          </View>
          <Feather name="chevron-forward" size={20} color="#52525b" />
        </TouchableOpacity>
      );
    }

    if (activeMode === "chats") {
      const other = item.participants?.find((p) => p._id !== item.currentUserId);
      const name = item.isGroup ? item.groupName : other?.name || "Unknown";
      return (
        <TouchableOpacity
          onPress={() => handleSelectChat(item)}
          className="flex-row items-center px-4 py-3"
        >
          <View className="w-12 h-12 rounded-full bg-dark-700 items-center justify-center">
            <Feather name={item.isGroup ? "users" : "user"} size={20} color="#71717a" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-dark-50">{name}</Text>
            {item.lastMessage && (
              <Text className="text-sm text-dark-400" numberOfLines={1}>
                {item.lastMessage.content || ""}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    // Global (messages)
    return (
      <View className="px-4 py-3 border-b border-white/[0.04]">
        <Text className="text-dark-200 text-sm">{item.content || ""}</Text>
        <Text className="text-dark-500 text-xs mt-1">{item.sender?.name || "Unknown"}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-dark-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3 border-b border-white/[0.04]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Feather name="arrow-left" size={24} color="#a1a1aa" />
        </TouchableOpacity>
        <TextInput
          className="flex-1 bg-dark-800 rounded-lg px-4 py-2 text-base text-dark-50"
          placeholder="Search chats, users, messages..."
          placeholderTextColor="#52525b"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      {/* Mode tabs */}
      <View className="flex-row border-b border-white/[0.04]">
        {MODES.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            onPress={() => setActiveMode(mode.key)}
            className={`flex-1 items-center py-3 ${
              activeMode === mode.key ? "border-b-2 border-accent-primary" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeMode === mode.key ? "text-accent-primary" : "text-dark-400"
              }`}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {searchLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : getCurrentResults().length > 0 ? (
        <FlatList
          data={getCurrentResults()}
          keyExtractor={(item) => item._id}
          renderItem={renderResult}
          className="flex-1"
        />
      ) : query.trim() ? (
        <View className="flex-1 items-center justify-center px-4">
          <Feather name="search" size={48} color="#3f3f46" />
          <Text className="text-dark-400 mt-4 text-base">No results found</Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <Feather name="search" size={48} color="#3f3f46" />
          <Text className="text-dark-400 mt-4 text-base">
            Search for chats, users, or messages
          </Text>
        </View>
      )}
    </View>
  );
}
