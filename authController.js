import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables (in case this file runs independently)
dotenv.config();

// Helper: Generate JWT
const generateToken = (id) => {
  // Debug log to confirm the key exists
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is missing. Please check your .env file.");
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// @desc Signup User
export const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
