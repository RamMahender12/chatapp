import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiLock, FiArrowRight, FiMessageCircle, FiEye, FiEyeOff } from "react-icons/fi";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex"
    >
      {/* Left panel - Visual */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-dark-900">
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%]"
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(99,102,241,0.06) 60deg, transparent 120deg, rgba(139,92,246,0.06) 180deg, transparent 240deg, rgba(167,139,250,0.04) 300deg, transparent 360deg)",
            }}
          />
        </div>

        <motion.div
          animate={{ y: [-15, 25, -15], x: [-5, 15, -5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[20%] w-56 h-56 rounded-full bg-accent-secondary/10 blur-[50px]"
        />
        <motion.div
          animate={{ y: [10, -25, 10] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] left-[25%] w-72 h-72 rounded-full bg-accent-primary/8 blur-[60px]"
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-16">
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
            className="mb-12"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl bg-accent-secondary/20 blur-xl"
              />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-secondary to-accent-primary flex items-center justify-center shadow-glow-lg">
                <FiMessageCircle className="w-12 h-12 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-5xl font-bold mb-4"
          >
            <span className="gradient-text">Join the Conversation</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-dark-200 text-lg text-center max-w-md leading-relaxed"
          >
            Create your account and start connecting with people around the world in seconds.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            {["Free to Use", "Instant Setup", "Private & Secure", "Cross Platform"].map(
              (feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + i * 0.1, type: "spring" }}
                  className="px-4 py-2 rounded-full glass-light text-sm text-dark-100"
                >
                  {feature}
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-dark-950 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent-secondary/[0.04] blur-[80px]" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md relative z-10"
        >
          <motion.div variants={itemVariants} className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-secondary to-accent-primary flex items-center justify-center">
              <FiMessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Chat Application</span>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-dark-50 mb-2">Create account</h2>
            <p className="text-dark-300 mb-8">
              Get started with your free account
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20"
            >
              <p className="text-danger text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants}>
              <label className="text-dark-300 text-xs font-medium uppercase tracking-wider mb-2 block">
                Full Name
              </label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5 group-focus-within:text-accent-primary transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-modern w-full pl-12"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="text-dark-300 text-xs font-medium uppercase tracking-wider mb-2 block">
                Email
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5 group-focus-within:text-accent-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-modern w-full pl-12"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="text-dark-300 text-xs font-medium uppercase tracking-wider mb-2 block">
                Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5 group-focus-within:text-accent-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="input-modern w-full pl-12 pr-12"
                  required
                  minLength={6}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </motion.button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <span className="relative z-10 flex items-center gap-2">
                    Create Account
                    <FiArrowRight className="w-4 h-4" />
                  </span>
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-dark-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-accent-primary hover:text-accent-tertiary transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;
