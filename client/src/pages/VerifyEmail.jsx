import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FiMail,
  FiCheck,
  FiRefreshCw,
  FiArrowRight,
  FiMessageCircle,
  FiShield,
} from "react-icons/fi";

const VerifyEmail = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { user, sendOTP, verifyOTP, logout } = useAuth();

  useEffect(() => {
    // Send OTP on mount
    handleSendOTP();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    try {
      const data = await sendOTP();
      if (data.bypass) {
        // Auto-verified, redirect to chat
        navigate("/");
        return;
      }
      if (data.devMode && data.otp) {
        setDevOtp(data.otp);
      }
    } catch (err) {
      console.error("Send OTP error:", err);
    }
  };

  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await verifyOTP(otpString);
      setSuccess("Email verified successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      // Shake animation handled by CSS
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setDevOtp("");

    try {
      const data = await sendOTP();
      if (data.devMode && data.otp) {
        setDevOtp(data.otp);
      }
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setResendLoading(false);
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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex items-center justify-center bg-dark-950 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-primary blur-[100px]"
        />
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-[20%] right-[20%] w-48 h-48 rounded-full bg-accent-secondary/10 blur-[60px]"
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <FiMessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">
            Chat Application
          </span>
        </motion.div>

        {/* Main card */}
        <motion.div
          variants={itemVariants}
          className="glass-strong rounded-3xl p-8 glow-border"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.3,
            }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl bg-accent-primary/20 blur-xl"
              />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-glow">
                <FiMail className="w-10 h-10 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="text-center mb-2">
            <h2 className="text-2xl font-bold text-dark-50">
              Verify your email
            </h2>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-center text-dark-300 text-sm mb-2"
          >
            We sent a 6-digit verification code to
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-center text-accent-primary font-semibold text-sm mb-6"
          >
            {user?.email}
          </motion.p>

          {/* Dev mode OTP display */}
          <AnimatePresence>
            {devOtp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="p-4 rounded-2xl bg-accent-primary/10 border border-accent-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FiShield className="w-4 h-4 text-accent-primary" />
                    <span className="text-accent-primary text-xs font-semibold">
                      Development Mode
                    </span>
                  </div>
                  <p className="text-dark-200 text-sm">
                    EmailJS not configured. Your OTP is:{" "}
                    <span className="text-accent-primary font-mono font-bold text-lg tracking-wider">
                      {devOtp}
                    </span>
                  </p>
                  <p className="text-dark-400 text-xs mt-1">
                    Check server console for OTP log
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
                  <p className="text-danger text-sm text-center">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                  <p className="text-success text-sm text-center flex items-center justify-center gap-2">
                    <FiCheck className="w-4 h-4" />
                    {success}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Input */}
          <form onSubmit={handleSubmit}>
            <motion.div
              variants={itemVariants}
              className="flex justify-center gap-3 mb-8"
            >
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.08, type: "spring" }}
                  whileFocus={{ scale: 1.05 }}
                  className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl outline-none transition-all duration-300 ${
                    digit
                      ? "bg-accent-primary/10 border-2 border-accent-primary/40 text-dark-50 shadow-glow-sm"
                      : "bg-dark-800/60 border-2 border-white/[0.06] text-dark-50"
                  } focus:border-accent-primary focus:bg-accent-primary/5 focus:shadow-glow`}
                />
              ))}
            </motion.div>

            {/* Verify Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading || success}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : success ? (
                  <span className="relative z-10 flex items-center gap-2">
                    <FiCheck className="w-5 h-5" />
                    Verified!
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center gap-2">
                    Verify Email
                    <FiArrowRight className="w-4 h-4" />
                  </span>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Resend */}
          <motion.div
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <p className="text-dark-400 text-sm mb-3">
              Didn't receive the code?
            </p>
            {canResend ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResend}
                disabled={resendLoading}
                className="inline-flex items-center gap-2 text-accent-primary hover:text-accent-tertiary transition-colors font-medium text-sm"
              >
                <motion.div
                  animate={resendLoading ? { rotate: 360 } : {}}
                  transition={{
                    duration: 1,
                    repeat: resendLoading ? Infinity : 0,
                    ease: "linear",
                  }}
                >
                  <FiRefreshCw className="w-4 h-4" />
                </motion.div>
                Resend Code
              </motion.button>
            ) : (
              <p className="text-dark-500 text-sm">
                Resend code in{" "}
                <span className="text-accent-primary font-mono font-semibold">
                  {countdown}s
                </span>
              </p>
            )}
          </motion.div>

          {/* Back to login */}
          <motion.div variants={itemVariants} className="mt-4 text-center">
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-dark-400 hover:text-dark-200 text-sm transition-colors"
            >
              Back to login
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default VerifyEmail;
