import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorHandler.js';
import reviewCycleRoutes from './routes/reviewCycles.js';
import employeeRoutes from './routes/employees.js';
import voteRoutes from './routes/votes.js';
import publicReviewCycleRoutes from './routes/publicReviewCycles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/accord-survey';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: CORS_ORIGIN }));

// Database connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Accord Survey API is running',
  });
});

// Routes
import authRoutes from './routes/auth.js';
import { protect } from './middleware/authMiddleware.js';

// ... (other imports)

// Routes
app.use('/api/auth', authRoutes);
// Routes
app.use('/api/review-cycles', reviewCycleRoutes);
app.use('/api/employees', protect, employeeRoutes);
// Public routes for survey consumption
app.use('/api/public/review-cycles', publicReviewCycleRoutes);
// Votes are public endpoints (vote submission/check are public)
app.use('/api/votes', voteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Accord Survey server running on port ${PORT}`);
  console.log(`MongoDB: ${MONGODB_URI}`);
  console.log(`CORS Origin: ${CORS_ORIGIN}`);
});
