const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

// Generate OTP (Auto register if user doesn't exist)
router.post('/login', async (req, res) => {
  try {
    const { mobile, email } = req.body;

    if (!mobile && !email) {
      return res.status(400).json({ message: 'Mobile or email is required' });
    }

    const otp =
      process.env.NODE_ENV === 'production'
        ? otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
          })
        : '123456';
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user exists
    let user = await User.findOne({ mobile: mobile });

    if (user) {
      // User already exists - update OTP for login
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // User doesn't exist - create new user (auto register)
      user = await User.create({
        mobile,
        email,
        otp,
        otpExpires,
      });
    }

    // In production, send OTP via SMS/Email service
    console.log(`OTP for ${mobile || email}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Only in development
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error sending OTP', error: error.message });
  }
});

// Verify OTP and Login/Register
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, email, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const user = await User.findOne({
      mobile: mobile,
      otp,
      otpExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error verifying OTP', error: error.message });
  }
});

// Get current user
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp');
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching user', error: error.message });
  }
});

module.exports = router;
