import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import postRoutes from './routes/postRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from "./routes/userRoutes.js";



import path from 'path';
import { fileURLToPath } from 'url';


// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

// Check JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET not found. Please check your .env file.');
  process.exit(1);
} else {
  console.log('✅ Loaded JWT_SECRET');
}

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/users", userRoutes);

// Connect MongoDB
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('🚀 Travel Blog Backend is running!');
});

app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
