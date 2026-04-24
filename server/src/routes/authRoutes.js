import express from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword ,
  verifyOTP,
  getDashboardStats
} from '../controllers/authController.js';

const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);


// THIS IS THE MISSING PIECE:
router.post('/verify-otp', verifyOTP);

// Password Management Routes
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Add this line
router.get('/stats', getDashboardStats);

export default router;