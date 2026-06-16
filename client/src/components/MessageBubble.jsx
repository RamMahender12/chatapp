import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "timeago.js";
import {
  FiCheck,
  FiDownload,
  FiMaximize2,
  FiX,
  FiChevronDown,
  FiCornerUpRight,
  FiCopy,
  FiSmile,
  FiSend,
  FiMapPin,
  FiStar,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import ForwardDialog from "./ForwardDialog";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "🥺", "😡"];

const MessageBubble = ({ message, isOwn, isGroup, index, totalMessages, onReply, user, onReact, onPin, onStar, onDelete }) => {
  const [imageExpanded, setImageExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [reactOpen, setReactOpen] = useState(false);
  const [reactPos, setReactPos] = useState({ top: 0, left: 0 });
  const [forwardOpen, setForwardOpen] = useState(false);
  const [moreReactionsOpen, setMoreReactionsOpen] = useState(false);
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  // Open more reactions picker
  const openMoreReactions = (e) => {
    e?.stopPropagation();
    const rect = menuBtnRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMoreReactionsOpen(true);
    setMenuOpen(false);
    const reactWidth = 280;
    const viewportW = window.innerWidth;
    let reactLeft;
    if (isOwn) {
      reactLeft = rect.left - reactWidth;
      if (reactLeft < 12) reactLeft = 12;
      if (reactLeft + reactWidth > viewportW - 12) {
        reactLeft = viewportW - reactWidth - 12;
      }
    } else {
      reactLeft = rect.right;
      if (reactLeft + reactWidth > viewportW - 12) {
        reactLeft = viewportW - reactWidth - 12;
      }
    }
    setReactPos({ top: rect.top - 60, left: reactLeft });
  };

  // Close menus when clicking outside
  useEffect(() => {
    if (!menuOpen && !reactOpen && !moreReactionsOpen) return;
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        menuBtnRef.current && !menuBtnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
        setReactOpen(false);
        setMoreReactionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen, reactOpen, moreReactionsOpen]);

  // Close menus when scrolling
  useEffect(() => {
    if (!menuOpen && !reactOpen && !moreReactionsOpen) return;
    const handler = () => { setMenuOpen(false); setReactOpen(false); setMoreReactionsOpen(false); };
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [menuOpen, reactOpen, moreReactionsOpen]);

  const handleCopy = useCallback(async () => {
    try {
      const text = message.content || message.mediaUrl || message.stickerId || "";
      await navigator.clipboard.writeText(text);
    } catch {}
    setMenuOpen(false);
  }, [message]);

  // If deleted, show placeholder
  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1.5`}>
        <div className="max-w-[75%] md:max-w-[60%] px-3.5 py-2 rounded-2xl bg-dark-800/30 border border-white/[0.02]">
          <p className="text-dark-500 text-[13px] italic">This message was deleted</p>
        </div>
      </div>
    );
  }

  const renderReplyPreview = () => {
    if (!message.replyTo) return null;
    const replied = message.replyTo;
    let previewText = replied.content || "";
    if (!previewText) {
      if (replied.messageType === "image") previewText = "📷 Photo";
      else if (replied.messageType === "video") previewText = "🎥 Video";
      else if (replied.messageType === "sticker") previewText = replied.stickerId || "🙂 Sticker";
    }
    return (
      <div className={`mb-1.5 pl-2 border-l-2 ${isOwn ? "border-white/50" : "border-accent-primary"}`}>
        <p className={`text-[11px] font-semibold leading-tight ${isOwn ? "text-white/80" : "text-accent-primary"}`}>
          {replied.sender?.name || "Unknown"}
        </p>
        <p className={`text-[12px] leading-tight truncate ${isOwn ? "text-white/60" : "text-dark-400"}`}>
          {previewText}
        </p>
      </div>
    );
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;
    const grouped = {};
    message.reactions.forEach((r) => {
      if (!grouped[r.emoji]) grouped[r.emoji] = [];
      grouped[r.emoji].push(r.user?.name || "Unknown");
    });
    return (
      <div className={`flex flex-wrap gap-0.5 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
        {Object.entries(grouped).map(([emoji, users]) => (
          <div
            key={emoji}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-dark-900/60 border border-white/[0.04] text-[11px]"
            title={users.join(", ")}
          >
            <span>{emoji}</span>
            {users.length > 1 && <span className="text-dark-400">{users.length}</span>}
          </div>
        ))}
      </div>
    );
  };

  const handleAction = (action) => {
    setMenuOpen(false);
    action();
  };

  const renderMenu = () => {
    if (!menuOpen) return null;
    return (
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.9, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -5 }}
        style={{ position: "fixed", top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
        className="w-[300px] bg-dark-800 border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Quick reaction bar */}
        <div className="flex items-center gap-0.5 px-3 py-2.5 border-b border-white/[0.06]">
          {QUICK_EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                onReact?.(message._id, emoji);
                setMenuOpen(false);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-xl transition-colors"
            >
              {emoji}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              openMoreReactions(e);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-lg text-dark-400 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Menu items */}
        <div className="py-1">
          {[
            { icon: FiCornerUpRight, label: "Reply", action: () => { onReply?.(message); } },
            { icon: FiCopy, label: "Copy", action: handleCopy },
            { icon: FiSmile, label: "React", action: openMoreReactions },
            { icon: FiSend, label: "Forward", action: () => setForwardOpen(true) },
            { icon: FiMapPin, label: message.pinned ? "Unpin" : "Pin", action: () => onPin?.(message._id) },
            { icon: FiStar, label: message.starredBy?.includes(user?._id) ? "Unstar" : "Star", action: () => onStar?.(message._id) },
            ...(isOwn ? [{ icon: FiTrash2, label: "Delete", action: () => onDelete?.(message._id), danger: true }] : []),
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              onClick={() => handleAction(item.action)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                item.danger ? "text-red-400 hover:text-red-300" : "text-dark-200 hover:text-dark-50"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

  const MORE_EMOJIS = [
    "❤️", "👍", "😂", "😮", "🥺", "😡",
    "🎉", "🔥", "💯", "✨", "💪", "🙏",
    "😍", "🤣", "😊", "😅", "😭", "😘",
    "🥰", "😇", "🤗", "🤔", "🙄", "😏",
    "😴", "🤒", "🥳", "🤩", "😎", "🧐",
    "👏", "🙌", "🫶", "💅", "👀", "👑",
    "💀", "☠️", "💩", "🤡", "👻", "🤖",
    "🎶", "💋", "💔", "🕊️", "🌹", "⭐",
  ];

  const renderMoreReactions = () => {
    if (!moreReactionsOpen) return null;
    return (
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.9, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -5 }}
        style={{ position: "fixed", top: reactPos.top, left: reactPos.left, zIndex: 9999 }}
        className="bg-dark-800 border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden p-2.5 w-[280px]"
      >
        <div className="grid grid-cols-6 gap-1">
          {MORE_EMOJIS.map((emoji, i) => (
            <motion.button
              key={`${emoji}-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.015 }}
              whileHover={{ scale: 1.25, y: -2 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => {
                onReact?.(message._id, emoji);
                setMoreReactionsOpen(false);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-xl transition-colors"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderContent = () => {
    switch (message.messageType) {
      case "sticker":
        return (
          <div className="flex flex-col items-center">
            {renderReplyPreview()}
            <motion.span
              className="text-7xl"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {message.stickerId}
            </motion.span>
            {message.content && (
              <p className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-dark-400"}`}>
                {message.content}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-[10px] ${isOwn ? "text-white/50" : "text-dark-500"}`}>
                {format(message.createdAt)}
              </span>
              {isOwn && <FiCheck className="w-3 h-3 text-white/50" />}
            </div>
            {renderReactions()}
          </div>
        );

      case "image":
        return (
          <div className="overflow-hidden rounded-xl">
            {renderReplyPreview()}
            <div className="relative group">
              <motion.img
                whileHover={{ scale: 1.02 }}
                src={message.mediaUrl}
                alt="Shared image"
                className="max-w-[280px] w-full h-auto rounded-xl cursor-pointer"
                onClick={() => setImageExpanded(true)}
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setImageExpanded(true)}
                  className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <FiMaximize2 className="w-4 h-4" />
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href={message.mediaUrl}
                  download
                  className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                </motion.a>
              </motion.div>
            </div>
            {message.content && (
              <p className={`text-[14px] leading-[20px] mt-2 ${isOwn ? "text-white" : "text-dark-50"}`}>
                {message.content}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1.5">
              <span className={`text-[10px] ${isOwn ? "text-white/60" : "text-dark-500"}`}>
                {format(message.createdAt)}
              </span>
              {isOwn && <FiCheck className="w-3.5 h-3.5 text-white/60" />}
            </div>
            {renderReactions()}
          </div>
        );

      case "video":
        return (
          <div className="overflow-hidden rounded-xl">
            {renderReplyPreview()}
            <video
              src={message.mediaUrl}
              controls
              className="max-w-[300px] w-full rounded-xl"
              preload="metadata"
            />
            {message.content && (
              <p className={`text-[14px] leading-[20px] mt-2 ${isOwn ? "text-white" : "text-dark-50"}`}>
                {message.content}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1.5">
              <span className={`text-[10px] ${isOwn ? "text-white/60" : "text-dark-500"}`}>
                {format(message.createdAt)}
              </span>
              {isOwn && <FiCheck className="w-3.5 h-3.5 text-white/60" />}
            </div>
            {renderReactions()}
          </div>
        );

      default:
        return (
          <div className="flex flex-col">
            {renderReplyPreview()}
            <div className="flex items-end gap-3">
              <p
                className={`text-[14px] leading-[20px] break-words whitespace-pre-wrap ${
                  isOwn ? "text-white" : "text-dark-50"
                }`}
              >
                {message.content}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0 self-end translate-y-[2px]">
                <span
                  className={`text-[10px] whitespace-nowrap ${
                    isOwn ? "text-white/60" : "text-dark-500"
                  }`}
                >
                  {format(message.createdAt)}
                </span>
                {isOwn && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FiCheck className="w-3.5 h-3.5 text-white/60" />
                  </motion.div>
                )}
                <button
                  ref={menuBtnRef}
                  onClick={(e) => {
                    console.log("menu trigger clicked");
                    if (menuOpen) {
                      setMenuOpen(false);
                      return;
                    }
                    setMenuOpen(true);
                    setReactOpen(false);
                    setMoreReactionsOpen(false);
                    const r = e.currentTarget.getBoundingClientRect();
                    const menuHeight = 280;
                    const isNearBottom = totalMessages - index - 1 < 8;
                    let top;
                    if (isNearBottom) {
                      top = Math.max(8, r.top - menuHeight);
                    } else {
                      top = r.top;
                    }
                    const menuWidth = 300;
                    const viewportW = window.innerWidth;
                    let left;
                    if (isOwn) {
                      left = r.left - 190;
                      if (left < 12) left = 12;
                      if (left + menuWidth > viewportW - 12) {
                        left = viewportW - menuWidth - 12;
                      }
                    } else {
                      left = r.right;
                      if (left + menuWidth > viewportW - 12) {
                        left = viewportW - menuWidth - 12;
                      }
                    }
                    setMenuPos({ top, left });
                  }}
                  className="p-0.5 rounded hover:bg-white/[0.1] text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <FiChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
            {renderReactions()}
          </div>
        );
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.3,
          delay: index * 0.02,
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1.5`}
      >
        <div
          className={`max-w-[75%] md:max-w-[60%] relative group ${
            message.messageType === "sticker" ? "bg-transparent" : ""
          }`}
        >
          {/* Sender name for groups */}
          {isGroup && !isOwn && message.messageType !== "sticker" && (
            <p className="text-accent-primary text-[11px] font-semibold mb-1 ml-1">
              {message.sender?.name}
            </p>
          )}

              {message.messageType === "sticker" ? (
            <div className="relative">
              {renderContent()}
              <div className="flex items-center gap-2 mt-1">
                {message.pinned && <span className="text-[10px] text-accent-primary">📌 Pinned</span>}
                {message.starredBy?.includes(user?._id) && <span className="text-[10px] text-amber-400">⭐ Starred</span>}
              </div>
            </div>
          ) : (
            <div
              className={`px-3.5 py-2.5 shadow-lg relative ${
                isOwn
                  ? "bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl rounded-br-md"
                  : "bg-dark-800/60 border border-white/[0.04] rounded-2xl rounded-bl-md"
              }`}
            >
          {(message.pinned || message.starredBy?.includes(user?._id)) && (
            <div className="flex items-center gap-2 mb-1">
              {message.pinned && <span className="text-[10px] text-accent-primary">📌 Pinned</span>}
              {message.starredBy?.includes(user?._id) && <span className="text-[10px] text-amber-400">⭐ Starred</span>}
            </div>
          )}
          {renderContent()}
          </div>
          )}
        </div>
      </motion.div>

      {/* Menu dropdown */}
      {renderMenu()}

      {/* More reactions picker */}
      {renderMoreReactions()}

      {/* Expanded image modal */}
      <AnimatePresence>
        {imageExpanded && message.messageType === "image" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setImageExpanded(false)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="absolute top-4 right-4 p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              onClick={() => setImageExpanded(false)}
            >
              <FiX className="w-6 h-6" />
            </motion.button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={message.mediaUrl}
              alt="Expanded"
              className="max-w-[90%] max-h-[90vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forward dialog */}
      <AnimatePresence>
        {forwardOpen && (
          <ForwardDialog message={message} onClose={() => setForwardOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default MessageBubble;
