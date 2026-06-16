import { useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";

const STICKER_PACKS = {
  "Classic": [
    { id: "thumbs_up", emoji: "👍", label: "Thumbs Up" },
    { id: "thumbs_down", emoji: "👎", label: "Thumbs Down" },
    { id: "heart", emoji: "❤️", label: "Heart" },
    { id: "fire", emoji: "🔥", label: "Fire" },
    { id: "clap", emoji: "👏", label: "Clap" },
    { id: "wave", emoji: "👋", label: "Wave" },
    { id: "laugh", emoji: "😂", label: "Laugh" },
    { id: "cry", emoji: "😭", label: "Cry" },
    { id: "angry", emoji: "😡", label: "Angry" },
    { id: "love", emoji: "😍", label: "Love" },
    { id: "think", emoji: "🤔", label: "Think" },
    { id: "party", emoji: "🎉", label: "Party" },
    { id: "rocket", emoji: "🚀", label: "Rocket" },
    { id: "star", emoji: "⭐", label: "Star" },
    { id: "check", emoji: "✅", label: "Check" },
    { id: "eyes", emoji: "👀", label: "Eyes" },
  ],
  "Reactions": [
    { id: "haha", emoji: "🤣", label: "Haha" },
    { id: "wow", emoji: "😮", label: "Wow" },
    { id: "sad", emoji: "😢", label: "Sad" },
    { id: "cool", emoji: "😎", label: "Cool" },
    { id: "nerd", emoji: "🤓", label: "Nerd" },
    { id: "sleep", emoji: "😴", label: "Sleep" },
    { id: "sick", emoji: "🤒", label: "Sick" },
    { id: "ghost", emoji: "👻", label: "Ghost" },
    { id: "devil", emoji: "😈", label: "Devil" },
    { id: "angel", emoji: "😇", label: "Angel" },
    { id: "robot", emoji: "🤖", label: "Robot" },
    { id: "alien", emoji: "👽", label: "Alien" },
    { id: "poop", emoji: "💩", label: "Poop" },
    { id: "clown", emoji: "🤡", label: "Clown" },
    { id: "skull", emoji: "💀", label: "Skull" },
    { id: "hundred", emoji: "💯", label: "100" },
  ],
  "Gestures": [
    { id: "ok", emoji: "👌", label: "OK" },
    { id: "peace", emoji: "✌️", label: "Peace" },
    { id: "crossed", emoji: "🤞", label: "Crossed" },
    { id: "shaka", emoji: "🤙", label: "Shaka" },
    { id: "fist", emoji: "✊", label: "Fist" },
    { id: "punch", emoji: "👊", label: "Punch" },
    { id: "muscle", emoji: "💪", label: "Muscle" },
    { id: "pray", emoji: "🙏", label: "Pray" },
    { id: "point_up", emoji: "☝️", label: "Point Up" },
    { id: "point_down", emoji: "👇", label: "Point Down" },
    { id: "point_left", emoji: "👈", label: "Point Left" },
    { id: "point_right", emoji: "👉", label: "Point Right" },
    { id: "vulcan", emoji: "🖖", label: "Vulcan" },
    { id: "metal", emoji: "🤘", label: "Metal" },
    { id: "call_me", emoji: "📞", label: "Call Me" },
    { id: "raised_hand", emoji: "✋", label: "Raised Hand" },
  ],
  "Fun": [
    { id: "confetti", emoji: "🎊", label: "Confetti" },
    { id: "balloon", emoji: "🎈", label: "Balloon" },
    { id: "gift", emoji: "🎁", label: "Gift" },
    { id: "trophy", emoji: "🏆", label: "Trophy" },
    { id: "medal", emoji: "🥇", label: "Medal" },
    { id: "crown", emoji: "👑", label: "Crown" },
    { id: "diamond", emoji: "💎", label: "Diamond" },
    { id: "lightning", emoji: "⚡", label: "Lightning" },
    { id: "boom", emoji: "💥", label: "Boom" },
    { id: "sparkles", emoji: "✨", label: "Sparkles" },
    { id: "rainbow", emoji: "🌈", label: "Rainbow" },
    { id: "sun", emoji: "☀️", label: "Sun" },
    { id: "moon", emoji: "🌙", label: "Moon" },
    { id: "snowflake", emoji: "❄️", label: "Snowflake" },
    { id: "clover", emoji: "🍀", label: "Clover" },
    { id: "mushroom", emoji: "🍄", label: "Mushroom" },
  ],
};

const StickerPicker = ({ onSelect, onClose }) => {
  const [activePack, setActivePack] = useState("Classic");

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="glass border-t border-white/[0.04] overflow-hidden"
    >
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
          <h4 className="text-dark-100 text-sm font-semibold">Stickers</h4>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.05] text-dark-400"
          >
            <FiX className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Pack tabs */}
        <div className="flex gap-2 px-3 py-2 border-b border-white/[0.04] overflow-x-auto">
          {Object.keys(STICKER_PACKS).map((pack) => (
            <motion.button
              key={pack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePack(pack)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activePack === pack
                  ? "bg-accent-primary/15 text-accent-primary border border-accent-primary/20"
                  : "text-dark-300 hover:text-dark-100 hover:bg-white/[0.05] border border-transparent"
              }`}
            >
              {pack}
            </motion.button>
          ))}
        </div>

        {/* Sticker grid */}
        <div className="h-52 overflow-y-auto p-3">
          <div className="grid grid-cols-4 gap-2">
            {STICKER_PACKS[activePack].map((sticker, i) => (
              <motion.button
                key={sticker.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.03, type: "spring" }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelect(sticker)}
                className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-white/[0.05] transition-colors group"
              >
                <motion.span
                  className="text-4xl"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {sticker.emoji}
                </motion.span>
                <span className="text-[10px] text-dark-400 group-hover:text-dark-200 transition-colors">
                  {sticker.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StickerPicker;
