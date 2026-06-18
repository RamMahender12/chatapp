import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";

import { STICKER_PACKS } from "../constants/stickers";

export default function StickerPicker({ visible, onClose, onSelect }) {
  const [activePack, setActivePack] = useState(0);
  const packNames = Object.keys(STICKER_PACKS);
  const currentPack = packNames[activePack];
  const stickers = STICKER_PACKS[currentPack] || [];

  const handleStickerPress = (sticker) => {
    onSelect(sticker);
    onClose();
  };

  const renderSticker = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleStickerPress(item)}
      className="items-center justify-center m-2"
      style={{ width: 72, height: 72 }}
    >
      <Text className="text-4xl">{item.emoji}</Text>
      <Text
        className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center"
        numberOfLines={1}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

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
        <View
          className="bg-white dark:bg-gray-800 rounded-t-2xl"
          style={{ maxHeight: 400 }}
        >
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Stickers
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Text className="text-gray-500 dark:text-gray-400 text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={stickers}
            keyExtractor={(item) => item.id}
            renderItem={renderSticker}
            numColumns={4}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
            showsVerticalScrollIndicator={false}
            className="flex-1"
          />

          <View className="flex-row border-t border-gray-200 dark:border-gray-700">
            {packNames.map((name, idx) => (
              <TouchableOpacity
                key={name}
                onPress={() => setActivePack(idx)}
                className={`flex-1 items-center py-2 ${
                  activePack === idx ? "border-b-2 border-blue-500" : ""
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    activePack === idx
                      ? "text-blue-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
