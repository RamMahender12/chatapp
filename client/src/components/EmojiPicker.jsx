import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";

const EMOJI_CATEGORIES = {
  "Smileys & People": {
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
      "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
      "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🫢",
      "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏",
      "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷",
      "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯",
      "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "🫤", "😟", "🙁",
      "☹️", "😮", "😯", "😲", "😳", "🥺", "🥹", "😦", "😧", "😨",
      "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩",
      "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️",
      "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "🎃", "😺",
      "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾",
    ],
  },
  "Gestures & Body": {
    icon: "👋",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "👌",
      "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "🖕", "👇", "☝️", "🫵", "👍", "👎", "✊", "👊", "🤛",
      "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "✍️", "💅",
      "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠",
      "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "🫦",
    ],
  },
  "Hearts & Symbols": {
    icon: "❤️",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
      "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️",
      "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏",
      "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴",
      "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐",
      "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑",
      "🅾️", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢",
      "♨️", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗", "❕",
      "❓", "❔", "‼️", "⁉️", "🔅", "🔆", "〽️", "⚠️", "🚸", "🔱",
      "⚜️", "🔰", "♻️", "✅", "🈯", "💹", "❇️", "✳️", "❎", "🌐",
      "💠", "Ⓜ️", "🌀", "💤", "🏧", "🚾", "♿", "🅿️", "🛗", "🈳",
      "🈂️", "🛂", "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "⚧️", "🚻",
    ],
  },
  "Animals & Nature": {
    icon: "🐶",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨",
      "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
      "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇",
      "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞",
      "🐜", "🪰", "🪲", "🪳", "🦟", "🦗", "🕷️", "🦂", "🐢", "🐍",
      "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠",
      "🐟", "🐬", "🐳", "🐋", "🦈", "🦭", "🐊", "🐅", "🐆", "🦓",
      "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦬",
    ],
  },
  "Food & Drink": {
    icon: "🍕",
    emojis: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐",
      "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑",
      "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅",
      "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳",
      "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟",
      "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘",
      "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪",
      "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧",
    ],
  },
  "Activities & Objects": {
    icon: "⚽",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
      "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳",
      "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷",
      "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤸", "🤺", "⛹️",
      "🎮", "🕹️", "🎲", "🧩", "♟️", "🎯", "🎳", "🎪", "🎨", "🎭",
      "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🪘", "🎷", "🎺", "🪗",
      "🎸", "🪕", "🎻", "🎵", "🎶", "🔔", "🔕", "📢", "📣", "💬",
    ],
  },
};

const EmojiPicker = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Smileys & People");

  const filteredEmojis = useMemo(() => {
    if (!search) return EMOJI_CATEGORIES[activeCategory].emojis;

    const all = Object.values(EMOJI_CATEGORIES).flatMap((cat) => cat.emojis);
    return all;
  }, [search, activeCategory]);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="glass border-t border-white/[0.04] overflow-hidden"
    >
      <div className="w-full">
        {/* Header with search */}
        <div className="flex items-center gap-2 p-3 border-b border-white/[0.04]">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emoji..."
              className="w-full bg-dark-800/60 text-dark-50 rounded-xl py-2 pl-10 pr-3 text-sm outline-none border border-white/[0.04] focus:border-accent-primary/30 transition-all placeholder:text-dark-500"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/[0.05] text-dark-400"
          >
            <FiX className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Category tabs */}
        {!search && (
          <div className="flex gap-1 px-3 py-2 border-b border-white/[0.04] overflow-x-auto">
            {Object.entries(EMOJI_CATEGORIES).map(([name, { icon }]) => (
              <motion.button
                key={name}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveCategory(name)}
                className={`p-2 rounded-xl text-lg transition-all flex-shrink-0 ${
                  activeCategory === name
                    ? "bg-accent-primary/10 shadow-glow-sm"
                    : "hover:bg-white/[0.05]"
                }`}
                title={name}
              >
                {icon}
              </motion.button>
            ))}
          </div>
        )}

        {/* Emoji grid */}
        <div className="h-52 overflow-y-auto p-2">
          <div className="grid grid-cols-8 gap-0.5">
            {filteredEmojis.map((emoji, i) => (
              <motion.button
                key={`${emoji}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.005 }}
                whileHover={{ scale: 1.3, y: -3 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => onSelect(emoji)}
                className="text-2xl p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmojiPicker;
