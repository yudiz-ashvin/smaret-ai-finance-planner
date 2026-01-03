const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateFinancialAdvice } = require('../services/aiService');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const AIAdvice = require('../models/AIAdvice');

// Get AI financial advice
router.get('/advice', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({ userId: req.userId });
    if (!budget) {
      return res
        .status(400)
        .json({ message: 'Please setup your budget first' });
    }

    // Get expenses for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startOfMonth },
    });

    // Generate AI advice
    const adviceList = await generateFinancialAdvice(
      req.userId,
      budget,
      expenses
    );

    // Save advice to database
    const savedAdvice = await AIAdvice.insertMany(
      adviceList.map((advice) => ({
        userId: req.userId,
        ...advice,
      }))
    );

    res.json({ advice: savedAdvice });
  } catch (error) {
    // Detailed error logging
    console.error('=== AI Advice Route Error ===');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Error Name:', error.name);
    console.error(
      'Full Error:',
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );
    console.error('============================');
    res.status(500).json({
      message: 'Error generating advice',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Get all saved advice
router.get('/advice/all', auth, async (req, res) => {
  try {
    const { isRead, limit = 20, page = 1 } = req.query;

    const query = { userId: req.userId };
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const advice = await AIAdvice.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AIAdvice.countDocuments(query);

    res.json({
      advice,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching advice', error: error.message });
  }
});

// Mark advice as read
router.put('/advice/:id/read', auth, async (req, res) => {
  try {
    const advice = await AIAdvice.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!advice) {
      return res.status(404).json({ message: 'Advice not found' });
    }

    res.json({ message: 'Advice marked as read', advice });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating advice', error: error.message });
  }
});

// Get spending analysis
router.get('/analysis', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({ userId: req.userId });
    if (!budget) {
      return res
        .status(400)
        .json({ message: 'Please setup your budget first' });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expenses = await Expense.aggregate([
      {
        $match: {
          userId: req.userId,
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
    ]);

    const analysis = expenses.map((exp) => {
      const budgeted = budget.categories[exp._id] || 0;
      const actual = exp.total;
      const variance = actual - budgeted;
      const variancePercent =
        budgeted > 0 ? ((variance / budgeted) * 100).toFixed(2) : 0;

      return {
        category: exp._id,
        budgeted,
        actual,
        variance,
        variancePercent: parseFloat(variancePercent),
        count: exp.count,
        avgAmount: Math.round(exp.avgAmount),
        status:
          variance > 0
            ? 'over'
            : variance < -budgeted * 0.1
            ? 'under'
            : 'on_track',
      };
    });

    console.log('Very Bad 🚀 ~ analysis:', analysis);
    res.json({ analysis });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error generating analysis', error: error.message });
  }
});

module.exports = router;
