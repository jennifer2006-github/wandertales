import Post from "../models/Post.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

/* ================= CREATE POST ================= */
export const createPost = async (req, res) => {
  try {
    const { title, description, location } = req.body;

    const post = await Post.create({
      title,
      description,
      location,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
      user: req.user.id,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Create post failed" });
  }
};

/* ================= GET ALL POSTS ================= */
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username")               // populate author
      .populate("comments.user", "username");    // populate comments user
    res.json(posts);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

/* ================= GET SINGLE POST ================= */
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(id)
      .populate("user", "username")
      .populate("comments.user", "username");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Failed to fetch post" });
  }
};

/* ================= LIKE / UNLIKE POST ================= */
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    // ✅ Return full updated post
    const updatedPost = await Post.findById(post._id)
      .populate("user", "username")
      .populate("comments.user", "username");

    res.json(updatedPost);
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Like failed" });
  }
};

/* ================= ADD COMMENT ================= */
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      text,
      user: req.user.id,
      username: req.user.username, // ✅ store username for display
    });

    await post.save();

    // ✅ Return full updated post
    const updatedPost = await Post.findById(post._id)
      .populate("user", "username")
      .populate("comments.user", "username");

    res.status(201).json(updatedPost);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

/* ================= DELETE POST ================= */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Delete image if exists
    if (post.imageUrl) {
      const filePath = path.join(process.cwd(), post.imageUrl);
      fs.unlink(filePath, (err) => {
        if (err) console.log("Image delete failed:", err.message);
      });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error while deleting post" });
  }
};
