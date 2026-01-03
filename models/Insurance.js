const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['health', 'term', 'life'],
    required: true
  },
  coverage: {
    type: Number,
    required: true
  },
  premium: {
    type: Number,
    required: true
  },
  duration: Number, // in years
  provider: String,
  status: {
    type: String,
    enum: ['suggested', 'pending', 'active'],
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

insuranceSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Insurance', insuranceSchema);

