import { useState } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

import { useChat } from "../context/ChatContext";

export default function CreateGroupScreen() {
  const navigation = useNavigation();
  const { createGroup } = useChat();
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const searchUsers = async (q) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/users/search?search=${encodeURIComponent(q)}`);
      const filtered = data.filter(
        (u) => !selectedUsers.find((s) => s._id === u._id)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }
    if (selectedUsers.length < 2) {
      Alert.alert("Error", "Please select at least 2 users");
      return;
    }
    setCreating(true);
    try {
      const userIds = selectedUsers.map((u) => u._id);
      await createGroup(groupName.trim(), userIds);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const renderSearchResult = ({ item }) => {
    const isSelected = selectedUsers.find((u) => u._id === item._id);
    return (
      <TouchableOpacity
        onPress={() => toggleUser(item)}
        className={`flex-row items-center px-4 py-3 ${
          isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
        }`}
      >
        <View className="w-10 h-10 rounded-full bg-gray-400 items-center justify-center">
          <Text className="text-white text-base font-bold">
            {item.name?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <Text className="ml-3 flex-1 text-base text-gray-900 dark:text-white">
          {item.name}
        </Text>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />}
      </TouchableOpacity>
    );
  };

  const renderSelectedUser = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleUser(item)}
      className="items-center mr-3"
    >
      <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center relative">
        <Text className="text-white text-lg font-bold">
          {item.name?.charAt(0)?.toUpperCase()}
        </Text>
        <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 items-center justify-center">
          <Text className="text-white text-xs font-bold">✕</Text>
        </View>
      </View>
      <Text
        className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center"
        numberOfLines={1}
      >
        {item.name?.split(" ")[0]}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            New Group
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={creating || selectedUsers.length < 2 || !groupName.trim()}
          className={`px-4 py-2 rounded-lg ${
            creating || selectedUsers.length < 2 || !groupName.trim()
              ? "bg-gray-300 dark:bg-gray-600"
              : "bg-blue-500"
          }`}
        >
          {creating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">Create</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <TextInput
          className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white"
          placeholder="Group name"
          placeholderTextColor="#9CA3AF"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      {selectedUsers.length > 0 && (
        <View className="py-3 border-b border-gray-200 dark:border-gray-700">
          <Text className="px-4 text-xs font-medium text-gray-500 uppercase mb-2">
            Selected ({selectedUsers.length})
          </Text>
          <FlatList
            data={selectedUsers}
            keyExtractor={(item) => item._id}
            renderItem={renderSelectedUser}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>
      )}

      <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <TextInput
          className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 text-base text-gray-900 dark:text-white"
          placeholder="Search users..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={(q) => {
            setSearchQuery(q);
            searchUsers(q);
          }}
        />
      </View>

      {loading && (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      )}

      {!loading && searchResults.length === 0 && searchQuery.trim() && (
        <View className="py-8 items-center">
          <Text className="text-gray-500 dark:text-gray-400">No users found</Text>
        </View>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item._id}
        renderItem={renderSearchResult}
        className="flex-1"
      />
    </View>
  );
}
