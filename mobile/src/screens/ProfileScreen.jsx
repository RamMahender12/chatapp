import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Profile
        </Text>
      </View>

      <View className="items-center py-8">
        <View className="w-24 h-24 rounded-full bg-blue-500 items-center justify-center mb-4">
          <Text className="text-white text-3xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          {user?.name}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {user?.email}
        </Text>
        {user?.isVerified && (
          <View className="flex-row items-center mt-2">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text className="text-green-500 text-sm ml-1">Verified</Text>
          </View>
        )}
      </View>

      <View className="mx-4 rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text className="ml-3 text-base text-gray-900 dark:text-white">
              Name
            </Text>
          </View>
          <Text className="text-base text-gray-500 dark:text-gray-400">
            {user?.name}
          </Text>
        </View>
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <Ionicons name="mail-outline" size={20} color="#6B7280" />
            <Text className="ml-3 text-base text-gray-900 dark:text-white">
              Email
            </Text>
          </View>
          <Text className="text-base text-gray-500 dark:text-gray-400">
            {user?.email}
          </Text>
        </View>
        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-row items-center">
            <Ionicons
              name={user?.isVerified ? "shield-checkmark" : "shield-outline"}
              size={20}
              color={user?.isVerified ? "#10B981" : "#6B7280"}
            />
            <Text className="ml-3 text-base text-gray-900 dark:text-white">
              Status
            </Text>
          </View>
          <Text
            className={`text-base ${
              user?.isVerified ? "text-green-500" : "text-gray-400"
            }`}
          >
            {user?.isVerified ? "Verified" : "Unverified"}
          </Text>
        </View>
      </View>

      <View className="mt-8 mx-4">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center py-4 bg-red-500 rounded-xl"
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text className="ml-2 text-white font-semibold text-base">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
