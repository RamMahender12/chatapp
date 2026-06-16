import { createContext, useContext, useState, useCallback, useRef } from "react";
import axios from "axios";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

function loadUnreadCounts() {
  try {
    const saved = localStorage.getItem("unreadCounts");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveUnreadCounts(counts) {
  try {
    localStorage.setItem("unreadCounts", JSON.stringify(counts));
  } catch {}
}

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);
  const [typingUsers, setTypingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("chats"); // 'chats' | 'users' | 'global'
  const [searchResults, setSearchResults] = useState({ chats: [], users: [], messages: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState(loadUnreadCounts);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [starredMessages, setStarredMessages] = useState([]);

  const fetchChats = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/chats");
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, []);

  const markAsRead = (chatId) => {
    if (!chatId) return;
    setUnreadCounts((prev) => {
      if (!prev[chatId]) return prev;
      const next = { ...prev, [chatId]: 0 };
      saveUnreadCounts(next);
      return next;
    });
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    if (chat?._id) {
      markAsRead(chat._id);
    }
  };

  const accessChat = async (userId) => {
    try {
      const { data } = await axios.post("/api/chats", { userId });
      if (!chats.find((c) => c._id === data._id)) {
        setChats((prev) => [data, ...prev]);
      }
      handleSelectChat(data);
      return data;
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  const createGroup = async (groupName, users) => {
    try {
      const { data } = await axios.post("/api/chats/group", { groupName, users });
      setChats((prev) => [data, ...prev]);
      handleSelectChat(data);
      return data;
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const fetchMessages = async (chatId, page = 1) => {
    if (page === 1) {
      setLoadingMessages(true);
    }

    try {
      const { data } = await axios.get(
        `/api/messages/${chatId}?page=${page}&limit=30`
      );

      if (page === 1) {
        setMessages(data.messages);
      } else {
        // Avoid duplicates when loading older messages
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const newMessages = data.messages.filter(
            (m) => !existingIds.has(m._id)
          );
          return [...newMessages, ...prev];
        });
      }

      setMessagesPage(page);
      setHasMoreMessages(data.hasMore);
      return data.messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    } finally {
      if (page === 1) {
        setLoadingMessages(false);
      }
    }
  };

  const loadMoreMessages = async (chatId) => {
    if (loadingMore || !hasMoreMessages) return [];
    setLoadingMore(true);

    try {
      const olderMessages = await fetchMessages(chatId, messagesPage + 1);
      return olderMessages;
    } finally {
      setLoadingMore(false);
    }
  };

  const sendMessage = async (chatId, content, extra = {}) => {
    try {
      const payload = { chatId, content, ...extra };
      const { data } = await axios.post("/api/messages", payload);
      setMessages((prev) => [...prev, data]);

      setChats((prev) => {
        const updated = prev.map((chat) =>
          chat._id === chatId
            ? { ...chat, lastMessage: data, lastMessageAt: data.createdAt }
            : chat
        );
        return updated.sort(
          (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );
      });

      return data;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const addMessage = (message) => {
    // Handle both populated and non-populated chat references
    const chatId =
      typeof message.chat === "object" ? message.chat?._id : message.chat;
    const chatParticipants =
      typeof message.chat === "object" ? message.chat?.participants : null;

    setMessages((prev) => {
      if (prev.find((m) => m._id === message._id)) return prev;
      return [...prev, message];
    });

    setChats((prev) => {
      const updated = prev.map((chat) =>
        chat._id === chatId
          ? {
              ...chat,
              lastMessage: message,
              lastMessageAt: message.createdAt,
              ...(chatParticipants && { participants: chatParticipants }),
            }
          : chat
      );
      return updated.sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );
    });

    // Increment unread count if message is for a different chat than selected
    if (chatId && chatId !== selectedChat?._id) {
      setUnreadCounts((prev) => {
        const next = { ...prev, [chatId]: (prev[chatId] || 0) + 1 };
        saveUnreadCounts(next);
        return next;
      });
    }
  };

  const reactToMessage = async (messageId, emoji) => {
    try {
      const { data } = await axios.post(`/api/messages/${messageId}/react`, { emoji });
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions: data.reactions } : m)));
      return data;
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  };

  const togglePin = async (messageId) => {
    try {
      const { data } = await axios.post(`/api/messages/${messageId}/pin`);
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, pinned: data.pinned, pinnedBy: data.pinnedBy } : m)));
      return data;
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  const toggleStar = async (messageId) => {
    try {
      const { data } = await axios.post(`/api/messages/${messageId}/star`);
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, starredBy: data.starredBy } : m)));
      return data;
    } catch (error) {
      console.error("Error starring message:", error);
    }
  };

  const fetchPinnedMessages = async (chatId) => {
    try {
      const { data } = await axios.get(`/api/messages/pinned/${chatId}`);
      setPinnedMessages(data);
      return data;
    } catch (error) {
      console.error("Error fetching pinned messages:", error);
    }
  };

  const fetchStarredMessages = async (chatId) => {
    try {
      const { data } = await axios.get(`/api/messages/starred/${chatId}`);
      setStarredMessages(data);
      return data;
    } catch (error) {
      console.error("Error fetching starred messages:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/messages/${messageId}`);
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, isDeleted: true } : m)));
      return data;
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const forwardMessage = async (messageId, chatId) => {
    try {
      const { data } = await axios.post(`/api/messages/${messageId}/forward`, { chatId });
      addMessage(data);
      return data;
    } catch (error) {
      console.error("Error forwarding message:", error);
    }
  };

  const setTyping = (chatId, userId) => {
    setTypingUsers((prev) => ({ ...prev, [chatId]: userId }));
  };

  const clearTyping = (chatId) => {
    setTypingUsers((prev) => {
      const copy = { ...prev };
      delete copy[chatId];
      return copy;
    });
  };

  const performSearch = useCallback(async (query, mode) => {
    setSearchLoading(true);
    setSearchQuery(query);
    setSearchMode(mode);

    if (!query.trim()) {
      setSearchResults({ chats: [], users: [], messages: [] });
      setSearchLoading(false);
      return;
    }

    try {
      if (mode === "chats") {
        const { data } = await axios.get(`/api/chats/search?q=${encodeURIComponent(query)}`);
        setSearchResults((prev) => ({ ...prev, chats: data }));
      } else if (mode === "users") {
        const { data } = await axios.get(`/api/users/search?search=${encodeURIComponent(query)}`);
        setSearchResults((prev) => ({ ...prev, users: data }));
      } else if (mode === "global") {
        const { data } = await axios.get(`/api/chats/search/global?q=${encodeURIComponent(query)}`);
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults({ chats: [], users: [], messages: [] });
    setSearchMode("chats");
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chats,
        selectedChat,
        setSelectedChat: handleSelectChat,
        unreadCounts,
        markAsRead,
        messages,
        loadingMessages,
        loadingMore,
        hasMoreMessages,
        typingUsers,
        fetchChats,
        accessChat,
        createGroup,
        fetchMessages,
        loadMoreMessages,
        sendMessage,
        addMessage,
        reactToMessage,
        togglePin,
        toggleStar,
        deleteMessage,
        pinnedMessages,
        starredMessages,
        fetchPinnedMessages,
        fetchStarredMessages,
        forwardMessage,
        setTyping,
        clearTyping,
        searchQuery,
        searchMode,
        searchResults,
        searchLoading,
        performSearch,
        clearSearch,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
