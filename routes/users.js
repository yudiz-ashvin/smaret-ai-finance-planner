const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { generateSmartBudget } = require('../services/aiService');
const Budget = require('../models/Budget');

// Update user profile (Salary Setup)
router.post('/setup-salary', auth, async (req, res) => {
  try {
    const { salary, age, city, familyMembers, hasEMI, emiAmount } = req.body;

    if (!salary || !age || !city) {
      return res.status(400).json({ message: 'Salary, age, and city are required' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        salary,
        age,
        city,
        familyMembers: familyMembers || 1,
        hasEMI: hasEMI || false,
        emiAmount: emiAmount || 0
      },
      { new: true }
    ).select('-password');

    // Generate smart budget
    const budgetCategories = await generateSmartBudget(
      salary,
      age,
      city,
      familyMembers || 1,
      hasEMI || false,
      emiAmount || 0
    );

    // Save or update budget
    let budget = await Budget.findOne({ userId: req.userId });
    if (budget) {
      budget.salary = salary;
      budget.categories = budgetCategories;
      budget.updatedAt = new Date();
      await budget.save();
    } else {
      budget = await Budget.create({
        userId: req.userId,
        salary,
        categories: budgetCategories
      });
    }

    res.json({
      message: 'Salary setup completed',
      user,
      budget
    });
  } catch (error) {
    res.status(500).json({ message: 'Error setting up salary', error: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

module.exports = router;

