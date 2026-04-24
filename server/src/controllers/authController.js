import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// Temporary storage for pending registrations
const pendingUsers = new Map();

// 1. REGISTER (Initial Step - Sends OTP)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Account already exists with this email." });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in pending map (Data stays in RAM, not DB, until verified)
    pendingUsers.set(email.toLowerCase().trim(), { 
      name, 
      email: email.toLowerCase().trim(), 
      password, 
      otp, 
      expires: Date.now() + 10 * 60 * 1000 
    });

    await sendEmail({
      email,
      subject: "Verification Code | AutoBiz AI",
      message: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #1e293b;">Verify your account</h2>
          <p style="color: #64748b;">Your 6-digit verification code is:</p>
          <h1 style="color: #4f46e5; letter-spacing: 8px; font-size: 40px;">${otp}</h1>
          <p style="color: #94a3b8; font-size: 12px;">This code expires in 10 minutes.</p>
        </div>`
    });

    res.status(200).json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. VERIFY OTP (Finalizes Registration)
export const verifyOTP = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const otp = req.body.otp.toString().trim(); 

    const userData = pendingUsers.get(email);

    if (!userData) {
      return res.status(400).json({ message: "Session expired or email mismatch. Please register again." });
    }

    if (userData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP code." });
    }

    if (Date.now() > userData.expires) {
      pendingUsers.delete(email);
      return res.status(400).json({ message: "OTP expired." });
    }

    // Create user in MongoDB (Pre-save hook in User model will hash the password)
    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      isVerified: true
    });

    pendingUsers.delete(email);

    res.status(201).json({ success: true, message: "Account verified and created!" });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 3. LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Email not verified' });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'hackathon_secret_2026', 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 4. FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
      <div style="font-family: sans-serif;">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link is valid for 10 minutes.</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      </div>`;

    await sendEmail({ email: user.email, subject: 'Password Reset | AutoBiz AI', message });
    res.status(200).json({ success: true, message: 'Reset link sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Token is invalid or has expired' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ... existing imports (User, etc.)

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Get real count from your DB
    const totalUsers = await User.countDocuments();

    // 2. Mock other data for now (to keep the UI looking "Pro")
    const stats = {
      totalInvoices: 12, // Static for now until you build the invoice model
      activeSystems: 1, 
      totalUsers: totalUsers,
      creditsUsed: '82%'
    };

    // 3. Get the 5 most recently registered users for the activity feed
    const recentActivity = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    res.status(200).json({
      success: true,
      stats,
      recentActivity: recentActivity.map(u => ({
        id: u._id,
        title: `New User Joined: ${u.name}`,
        time: u.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};