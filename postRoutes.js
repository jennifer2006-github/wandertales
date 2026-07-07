import express from "express";
import multer from "multer";
import auth from "../middleware/auth.js";

import {
  createPost,
  getPosts,
  getPost,
  likePost,
  addComment,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

/* Multer config */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/* Routes */
router.get("/", getPosts);
router.get("/:id", getPost);

// ✅ Auth routes
router.post("/", auth, upload.single("image"), createPost);
router.put("/:id/like", auth, likePost);
router.post("/:id/comment", auth, addComment);
router.delete("/:id", auth, deletePost);

export default router;
