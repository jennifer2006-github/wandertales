import User from "../models/User.js";
import Post from "../models/Post.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("name username email createdAt");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: fetch user's posts
    const posts = await Post.find({ user: id }).sort({ createdAt: -1 });

    res.json({ ...user.toObject(), posts });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
