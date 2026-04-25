import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import invoiceRoutes from './routes/invoiceRoutes.js'; // ✅ ADD HERE (TOP)
import emailRoutes from './routes/emailRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import ocrRoutes from './routes/ocrRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import negotiationRoutes from './routes/negotiationRoutes.js';
// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();``

// Body Parser Middleware
app.use(express.json());``
app.use(cors());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/invoices', invoiceRoutes); // ✅ ADD HERE (BEFORE listen)
app.use('/api/v1/emails', emailRoutes); // ✅ ADD HERE (BEFORE listen)
app.use('/api/v1/chat', chatRoutes); // ✅ ADD HERE (BEFORE listen)
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ocr', ocrRoutes); // This creates the /api/v1/ocr/scan path
app.use('/api/v1/agent', agentRoutes); // ✅ ADD HERE (BEFORE listen) 
app.use('/api/negotiation', negotiationRoutes);
// Test Route (optional but useful)
app.get('/', (req, res) => {
  res.send('API Running...');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});