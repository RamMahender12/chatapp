import { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, useWindowDimensions } from "react-native";

import { EMOJI_CATEGORIES } from "../constants/emojis";

const EMOJI_SIZE = 40;
const EMOJIS_PER_ROW = 7;

export default function EmojiPicker({ visible, onClose, onSelect }) {
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const flatListRef = useRef(null);

  const categoryNames = Object.keys(EMOJI_CATEGORIES);

  const categoryEntries = useCallback(() => {
    return Object.entries(EMOJI_CATEGORIES).map(([name, data]) => ({
      name,
      icon: data.icon,
      emojis: data.emojis,
    }));
  }, []);

  const allEmojis = useCallback(() => {
    return Object.values(EMOJI_CATEGORIES).flatMap((cat) => cat.emojis);
  }, []);

  const filtered = search
    ? allEmojis().filter((e) => e.includes(search))
    : null;

  const handleEmojiPress = (emoji) => {
    onSelect(emoji);
    onClose();
  };

  const handleCategoryTab = (index) => {
    setActiveCategory(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    let cumulative = 0;
    const entries = categoryEntries();
    for (let i = 0; i < entries.length; i++) {
      const emojiCount = entries[i].emojis.length;
      const rows = Math.ceil(emojiCount / EMOJIS_PER_ROW);
      const sectionHeight = rows * EMOJI_SIZE + 40;
      if (offsetY < cumulative + sectionHeight) {
        if (activeCategory !== i) setActiveCategory(i);
        break;
      }
      cumulative += sectionHeight;
    }
  };

  const renderCategory = ({ item }) => {
    const { name, icon, emojis } = item;
    return (
      <View className="mb-2">
        <View className="flex-row items-center px-3 py-2">
          <Text className="text-xl mr-2">{icon}</Text>
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {name}
          </Text>
        </View>
        <View className="flex-row flex-wrap px-2">
          {emojis.map((emoji, idx) => (
            <TouchableOpacity
              key={`${name}-${idx}`}
              onPress={() => handleEmojiPress(emoji)}
              className="items-center justify-center"
              style={{ width: EMOJI_SIZE, height: EMOJI_SIZE }}
            >
              <Text className="text-2xl">{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

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
          <View className="flex-row items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <TextInput
              className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
              placeholder="Search emojis..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity onPress={onClose} className="ml-2 p-2">
              <Text className="text-gray-500 dark:text-gray-400">✕</Text>
            </TouchableOpacity>
          </View>

          {search ? (
            <View className="flex-row flex-wrap px-2 py-2">
              {filtered.map((emoji, idx) => (
                <TouchableOpacity
                  key={`search-${idx}`}
                  onPress={() => handleEmojiPress(emoji)}
                  className="items-center justify-center"
                  style={{ width: EMOJI_SIZE, height: EMOJI_SIZE }}
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={categoryEntries()}
              keyExtractor={(item) => item.name}
              renderItem={renderCategory}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              className="flex-1"
            />
          )}

          {!search && (
            <View className="flex-row border-t border-gray-200 dark:border-gray-700">
              {categoryEntries().map((cat, idx) => (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => handleCategoryTab(idx)}
                  className={`flex-1 items-center py-2 ${
                    activeCategory === idx
                      ? "border-b-2 border-blue-500"
                      : ""
                  }`}
                >
                  <Text className="text-xl">{cat.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
