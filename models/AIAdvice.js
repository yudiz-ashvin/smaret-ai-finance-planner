const mongoose = require('mongoose');

const aiAdviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adviceType: {
    type: String,
    enum: [
      'spending',
      'saving',
      'investment',
      'insurance',
      'budget',
      'general',
    ],
    default: 'general',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  category: String,
  amount: Number,
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

aiAdviceSchema.index({ userId: 1, createdAt: -1 });
aiAdviceSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('AIAdvice', aiAdviceSchema);
