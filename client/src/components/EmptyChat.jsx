import { motion } from "framer-motion";
import { FiLock, FiMessageCircle, FiShield, FiZap, FiGlobe } from "react-icons/fi";

const EmptyChat = () => {
  const features = [
    { icon: FiZap, label: "Lightning Fast", desc: "Real-time delivery" },
    { icon: FiShield, label: "Secure", desc: "End-to-end encrypted" },
    { icon: FiGlobe, label: "Connected", desc: "Chat from anywhere" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center bg-dark-950 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-primary blur-[100px]"
        />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-dark-950/50 to-dark-950" />
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-10 text-center max-w-lg px-8"
      >
        {/* Animated logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.3 }}
          className="mx-auto mb-10"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl bg-accent-primary/20 blur-2xl"
            />
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-tertiary flex items-center justify-center shadow-glow-lg"
            >
              <FiMessageCircle className="w-12 h-12 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold mb-3"
        >
          <span className="gradient-text">Welcome to Chat</span>
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-dark-300 text-sm leading-relaxed mb-10 max-w-sm mx-auto"
        >
          Select a conversation from the sidebar or start a new one to begin
          messaging.
        </motion.p>

        {/* Feature cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-4 rounded-2xl glass-light border border-white/[0.04] text-center"
            >
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-3"
              >
                <feature.icon className="w-5 h-5 text-accent-primary" />
              </motion.div>
              <p className="text-dark-100 text-xs font-semibold mb-0.5">
                {feature.label}
              </p>
              <p className="text-dark-500 text-[10px]">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex items-center justify-center gap-2 text-dark-500 text-xs"
        >
          <FiLock className="w-3 h-3" />
          <span>Your messages are private and secure</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EmptyChat;
