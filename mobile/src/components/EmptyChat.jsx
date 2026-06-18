import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function EmptyChat() {
  return (
    <View className="flex-1 items-center justify-center bg-dark-950 px-8">
      <View className="w-24 h-24 rounded-full bg-accent-primary/10 items-center justify-center mb-6">
        <Feather name="message-circle" size={40} color="#8b5cf6" />
      </View>
      <Text className="text-xl font-bold text-dark-50 mb-2">
        No chat selected
      </Text>
      <Text className="text-dark-400 text-center leading-6">
        Select a conversation from the sidebar or start a new chat
      </Text>
    </View>
  );
}
