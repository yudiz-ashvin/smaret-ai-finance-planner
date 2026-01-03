const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const User = require('../models/User');

// Get budget dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    let budget = await Budget.findOne({ userId: req.userId });

    if (!budget) {
      const user = await User.findById(req.userId);
      if (!user || !user.salary) {
        return res
          .status(400)
          .json({ message: 'Please setup your salary first' });
      }

      const { generateSmartBudget } = require('../services/aiService');
      const categories = await generateSmartBudget(
        user.salary,
        user.age,
        user.city,
        user.familyMembers,
        user.hasEMI,
        user.emiAmount
      );

      budget = await Budget.create({
        userId: req.userId,
        salary: user.salary,
        categories,
      });
    }

    // Get actual expenses for current month
    const startOfMonth = new Date();
    const endOfMonth = new Date();
    endOfMonth.setDate(endOfMonth.getDate());
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const expenses = await Expense.aggregate([
      {
        $match: {
          userId: budget.userId,
          // date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const actualExpenses = {};
    expenses.forEach((exp) => {
      actualExpenses[exp._id] = exp.total;
    });

    // Calculate remaining amounts
    const remaining = {};
    Object.keys(budget.categories).forEach((category) => {
      remaining[category] =
        budget.categories[category] - (actualExpenses[category] || 0);
    });

    res.json({
      budget: {
        salary: budget.salary,
        categories: budget.categories,
        actualExpenses,
        remaining,
        totalSpent: Object.values(actualExpenses).reduce(
          (sum, val) => sum + val,
          0
        ),
        totalBudgeted: Object.values(budget.categories).reduce(
          (sum, val) => sum + val,
          0
        ),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching budget', error: error.message });
  }
});

// Update budget categories manually
router.put('/update', auth, async (req, res) => {
  try {
    const { categories } = req.body;

    let budget = await Budget.findOne({ userId: req.userId });
    if (!budget) {
      return res
        .status(404)
        .json({ message: 'Budget not found. Please setup salary first.' });
    }

    budget.categories = { ...budget.categories, ...categories };
    budget.updatedAt = new Date();
    await budget.save();

    res.json({ message: 'Budget updated successfully', budget });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating budget', error: error.message });
  }
});

module.exports = router;
