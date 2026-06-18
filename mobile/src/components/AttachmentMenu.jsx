import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ATTACHMENT_OPTIONS = [
  {
    id: "camera",
    label: "Camera",
    icon: "camera-outline",
    color: "#3B82F6",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: "images-outline",
    color: "#10B981",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: "document",
    label: "Document",
    icon: "document-outline",
    color: "#F59E0B",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    id: "sticker",
    label: "Sticker",
    icon: "happy-outline",
    color: "#8B5CF6",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
];

export default function AttachmentMenu({ visible, onClose, onSelect }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="bg-white dark:bg-gray-800 rounded-t-2xl px-6 pb-8 pt-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Attach
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Text className="text-gray-500 dark:text-gray-400 text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-around">
            {ATTACHMENT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => {
                  onSelect(option.id);
                  onClose();
                }}
                className="items-center"
              >
                <View
                  className={`w-16 h-16 rounded-full items-center justify-center ${option.bg}`}
                >
                  <Ionicons name={option.icon} size={28} color={option.color} />
                </View>
                <Text className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
