const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['rent', 'food', 'travel', 'health', 'investment', 'emergency', 'emi', 'shopping', 'utilities', 'other']
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  date: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['manual', 'bank_statement', 'ai_detected'],
    default: 'manual'
  },
  statementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankStatement'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);

