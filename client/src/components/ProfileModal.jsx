import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FiX, FiMail, FiUser, FiInfo, FiLogOut, FiEdit3 } from "react-icons/fi";

const ProfileModal = ({ onClose }) => {
  const { user, logout } = useAuth();

  const infoItems = [
    { icon: FiUser, label: "Name", value: user?.name },
    { icon: FiMail, label: "Email", value: user?.email },
    { icon: FiInfo, label: "About", value: user?.about || "Hey there! I'm using Chat Application" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
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
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative glass-strong rounded-3xl shadow-2xl w-[90%] max-w-sm overflow-hidden glow-border"
      >
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-black/30 text-white/80 hover:text-white hover:bg-black/50 transition-all backdrop-blur-sm"
        >
          <FiX className="w-4 h-4" />
        </motion.button>

        {/* Header with gradient */}
        <div className="relative h-36 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-tertiary" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.1) 90deg, transparent 180deg, rgba(255,255,255,0.05) 270deg, transparent 360deg)",
            }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-16 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl bg-accent-primary/30 blur-lg"
            />
            <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-4xl font-bold border-4 border-dark-900 shadow-glow">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-dark-800 border border-white/10 flex items-center justify-center text-accent-primary hover:bg-dark-700 transition-colors"
            >
              <FiEdit3 className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        </div>

        {/* Name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-4 px-6"
        >
          <h3 className="text-xl font-bold text-dark-50">{user?.name}</h3>
          <p className="text-dark-400 text-sm mt-0.5">{user?.email}</p>
        </motion.div>

        {/* Info cards */}
        <div className="p-6 space-y-2.5">
          {infoItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-dark-800/40 border border-white/[0.04]"
            >
              <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-accent-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-dark-500 text-[11px] font-medium uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-dark-100 text-sm truncate">{item.value}</p>
              </div>
            </motion.div>
          ))}

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-danger/10 border border-danger/20 text-danger py-3.5 rounded-2xl font-medium hover:bg-danger/15 transition-all mt-4 text-sm"
          >
            <FiLogOut className="w-4 h-4" />
            Sign out
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileModal;
