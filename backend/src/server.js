require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173', // for local frontend dev
    'http://localhost:5174'
  ].filter(Boolean),
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: false, // allow serving audio files to frontend
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 25, // Limit each IP to 25 requests per `window` (here, per 1 minute)
  message: { error: 'Voice chat limit reached. Please pause for a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// Serve static files (like generated audio)
app.use(express.static(path.join(__dirname, '..', 'public')));

const courseRoutes = require('./routes/course.routes');
const chatRoutes = require('./routes/chat.routes');
const adminRoutes = require('./routes/admin.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// API Routes
app.use('/api/courses', courseRoutes);
app.use('/api/chat', chatLimiter, chatRoutes); // Stricter limit on chat
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Database connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));
} else {
  console.log('MONGODB_URI is not set. Running without database.');
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]', err.stack);
  res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Backend ready.');
});
