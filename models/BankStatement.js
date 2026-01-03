const mongoose = require('mongoose');

const bankStatementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: String,
  filePath: String,
  fileType: {
    type: String,
    enum: ['pdf', 'csv', 'image']
  },
  extractedData: [{
    date: Date,
    description: String,
    amount: Number,
    type: {
      type: String,
      enum: ['debit', 'credit']
    },
    category: String,
    confidence: Number
  }],
  totalDebits: {
    type: Number,
    default: 0
  },
  totalCredits: {
    type: Number,
    default: 0
  },
  processedAt: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bankStatementSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('BankStatement', bankStatementSchema);

