const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const clientRoutes = require('./routes/clientRoutes');

// Connect to database
connectDB();

const app = express();

// Updated CORS configuration to accept requests from Vercel frontend
app.use(cors({
  origin: [
    'https://dei-invoice-system.vercel.app',  // Your Vercel frontend URL
    'http://localhost:3000',                    // Local development
    'http://localhost:5173',                     // Vite default port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,                             // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests for all routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/clients', clientRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Accepting requests from: https://dei-invoice-system.vercel.app`);
});