import express from "express";
import User from "../models/User.js";
import { generateOTP, sendOTPEmail } from "../utils/email.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Test bypass emails
const BYPASS_VERIFICATION = [
  "ram.mahender@gmail.com",
  "ram.mahender74@gmail.com",
];

router.post("/send-otp", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Auto-verify bypass emails
    if (BYPASS_VERIFICATION.includes(user.email.toLowerCase())) {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
      return res.json({ message: "Auto-verified", bypass: true });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    try {
      await sendOTPEmail(user.email, otp, user.name);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Still return success with OTP in dev mode
      if (process.env.EMAILJS_SERVICE_ID) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }
    }

    res.json({
      message: "OTP sent successfully",
      // In dev mode without EmailJS, send OTP in response for testing
      ...(process.env.EMAILJS_SERVICE_ID ? {} : { otp, devMode: true }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/verify-otp", protect, async (req, res) => {
  try {
    const { otp } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Auto-verify bypass emails
    if (BYPASS_VERIFICATION.includes(user.email.toLowerCase())) {
      if (!user.isVerified) {
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
      }
      return res.json({ message: "Email verified successfully" });
    }

    if (!otp) {
      return res.status(400).json({ message: "Please provide OTP" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "No OTP found. Please request a new one" });
    }

    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/verification-status", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("isVerified email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ isVerified: user.isVerified, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
