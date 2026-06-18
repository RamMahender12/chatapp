import { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import ChatItem from "../components/ChatItem";

export default function ChatsListScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { chats, unreadCounts, fetchChats } = useChat();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleChatPress = useCallback(
    (chat) => {
      navigation.navigate("Chat", { chatId: chat._id, chatName: chat.isGroup ? chat.groupName : "" });
    },
    [navigation]
  );

  return (
    <View className="flex-1 bg-dark-950" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/[0.04]">
        <Text className="text-xl font-bold text-dark-50">Chats</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => navigation.navigate("SearchUsers")} activeOpacity={0.7}>
            <Feather name="search" size={22} color="#a1a1aa" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("CreateGroup")} activeOpacity={0.7}>
            <Feather name="user-plus" size={22} color="#a1a1aa" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} activeOpacity={0.7}>
            <Feather name="user" size={22} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat list */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ChatItem
            chat={item}
            userId={user?._id}
            unreadCount={unreadCounts[item._id] || 0}
            onPress={handleChatPress}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={fetchChats}
            tintColor="#8b5cf6"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20 px-8">
            <Feather name="message-square" size={48} color="#3f3f46" />
            <Text className="text-dark-400 text-lg font-medium mt-4">
              No chats yet
            </Text>
            <Text className="text-dark-500 text-center mt-2">
              Search for users to start a conversation
            </Text>
          </View>
        }
        contentContainerStyle={chats.length === 0 ? { flexGrow: 1 } : {}}
      />
    </View>
  );
}
