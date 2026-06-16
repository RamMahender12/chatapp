import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Test bypass emails - skip verification for these
const BYPASS_VERIFICATION = [
  "ram.mahender@gmail.com",
  "ram.mahender74@gmail.com",
];

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const shouldAutoVerify = BYPASS_VERIFICATION.includes(email.toLowerCase());

    // For bypass emails, allow re-registration by deleting old account
    if (shouldAutoVerify) {
      await User.deleteOne({ email: email.toLowerCase() });
    } else {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      isVerified: shouldAutoVerify,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      about: user.about,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      // Auto-verify bypass emails on login if not already verified
      if (!user.isVerified && BYPASS_VERIFICATION.includes(user.email.toLowerCase())) {
        user.isVerified = true;
        await user.save();
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        about: user.about,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
