import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  USER_INFO: "userInfo",
  UNREAD_COUNTS: "unreadCounts",
};

export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
};

export default KEYS;
