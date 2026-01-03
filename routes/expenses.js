const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

// Add manual expense
router.post('/add', auth, async (req, res) => {
  try {
    const { category, amount, description, date } = req.body;

    if (!category || !amount) {
      return res
        .status(400)
        .json({ message: 'Category and amount are required' });
    }

    const expense = await Expense.create({
      userId: req.userId,
      category,
      amount,
      description,
      date: date ? new Date(date) : new Date(),
      source: 'manual',
    });

    res.status(201).json({ message: 'Expense added successfully', expense });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error adding expense', error: error.message });
  }
});

// Get all expenses
router.get('/', auth, async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 50, page = 1 } = req.query;

    const query = { userId: req.userId };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
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
      .json({ message: 'Error fetching expenses', error: error.message });
  }
});

// Get expense summary by category
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = { userId: req.userId };
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const summary = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ summary });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching expense summary',
      error: error.message,
    });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating expense', error: error.message });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting expense', error: error.message });
  }
});

module.exports = router;
