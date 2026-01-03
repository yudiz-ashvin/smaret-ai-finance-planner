const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String
  },
  otp: {
    type: String
  },
  otpExpires: Date,
  googleId: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  salary: {
    type: Number,
    default: 0
  },
  age: Number,
  city: String,
  familyMembers: {
    type: Number,
    default: 1
  },
  hasEMI: {
    type: Boolean,
    default: false
  },
  emiAmount: {
    type: Number,
    default: 0
  },
  riskProfile: {
    type: String,
    enum: ['conservative', 'moderate', 'aggressive'],
    default: 'moderate'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);

