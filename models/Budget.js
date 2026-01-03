const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  categories: {
    rent: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    travel: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    investment: { type: Number, default: 0 },
    emergency: { type: Number, default: 0 },
    freeMoney: { type: Number, default: 0 },
    emi: { type: Number, default: 0 },
    shopping: { type: Number, default: 0 },
    utilities: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

budgetSchema.index({ userId: 1 });

module.exports = mongoose.model('Budget', budgetSchema);

