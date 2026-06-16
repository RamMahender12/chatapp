import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useChat } from "../context/ChatContext";
import { FiX, FiSearch, FiUser, FiMessageCircle, FiArrowRight } from "react-icons/fi";

const SearchUsers = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { accessChat, fetchMessages } = useChat();

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`/api/users/search?search=${val}`);
      setUsers(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (userId) => {
    const chat = await accessChat(userId);
    if (chat) {
      fetchMessages(chat._id);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ y: -40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -40, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative glass-strong rounded-3xl shadow-2xl w-[90%] max-w-md overflow-hidden glow-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center">
              <FiMessageCircle className="w-4 h-4 text-accent-primary" />
            </div>
            <h3 className="text-dark-50 font-semibold text-lg">New Conversation</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/[0.05] text-dark-400 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Search */}
        <div className="p-5 pb-3">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4 group-focus-within:text-accent-primary transition-colors" />
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Search by name or email..."
              autoFocus
              className="input-modern w-full pl-12"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto px-2 pb-3">
          {loading && (
            <div className="flex justify-center py-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-accent-primary/20 border-t-accent-primary rounded-full"
              />
            </div>
          )}

          <AnimatePresence>
            {users.map((u, index) => (
              <motion.button
                key={u._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ backgroundColor: "rgba(139,92,246,0.05)" }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(u._id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group"
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-primary/80 to-accent-secondary/80 flex items-center justify-center text-white font-bold text-sm">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  {u.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-dark-900" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-dark-50 text-sm font-semibold">{u.name}</p>
                  <p className="text-dark-400 text-xs">{u.email}</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiArrowRight className="w-4 h-4 text-accent-primary" />
                </motion.div>
              </motion.button>
            ))}
          </AnimatePresence>

          {query.length >= 2 && !loading && users.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-12"
            >
              <div className="w-14 h-14 rounded-2xl bg-dark-800/50 flex items-center justify-center mb-4">
                <FiUser className="w-7 h-7 text-dark-500" />
              </div>
              <p className="text-dark-300 text-sm font-medium">No users found</p>
              <p className="text-dark-500 text-xs mt-1">Try a different search term</p>
            </motion.div>
          )}

          {query.length < 2 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent-primary/5 flex items-center justify-center mb-4">
                <FiSearch className="w-7 h-7 text-accent-primary/30" />
              </div>
              <p className="text-dark-400 text-sm">Type to search for people</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchUsers;
