const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['sip', 'fd', 'mutual_fund', 'stocks', 'emergency_fund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  frequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'one_time'],
    default: 'monthly'
  },
  expectedReturns: Number, // percentage
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  status: {
    type: String,
    enum: ['suggested', 'active', 'completed'],
    default: 'suggested'
  },
  suggestedBy: {
    type: String,
    default: 'ai'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

investmentSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Investment', investmentSchema);

