const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const clientRoutes = require('./routes/clientRoutes.js');
const authRoutes = require('./routes/authRoutes.js')
// Connect to database
connectDB();

const app = express();

// Updated CORS configuration to accept requests from Vercel frontend
app.use(cors({
  origin: [
                      // Local development
    'https://dei-invoice-system.vercel.app',                     // Vite default port
   
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
app.use('/api/auth', authRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Add this temporary route in your backend (server.js) for testing
app.get('/api/debug/clients-count', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('clients');
    const count = await collection.countDocuments();
    const allClients = await collection.find({}).toArray();
    res.json({ 
      count, 
      clients: allClients,
      collections: await db.listCollections().toArray()
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Accepting requests from: https://dei-invoice-system.vercel.app`);
});