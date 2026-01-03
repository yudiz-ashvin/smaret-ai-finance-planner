const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Investment = require('../models/Investment');
const User = require('../models/User');
const { generateInvestmentRecommendations } = require('../services/aiService');

// Get investment recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.salary) {
      return res
        .status(400)
        .json({ message: 'Please setup your salary first' });
    }

    const recommendations = await generateInvestmentRecommendations(
      user.salary,
      user.age,
      user.riskProfile || 'moderate'
    );

    // Save recommendations
    for (let rec of recommendations) {
      await Investment.findOneAndUpdate(
        { userId: req.userId, type: rec.type, status: 'suggested' },
        {
          userId: req.userId,
          ...rec,
          status: 'suggested',
          suggestedBy: 'ai',
        },
        { upsert: true, new: true }
      );
    }

    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({
      message: 'Error generating recommendations',
      error: error.message,
    });
  }
});

// Get all investments
router.get('/', auth, async (req, res) => {
  try {
    const { type, status } = req.query;

    const query = { userId: req.userId };
    if (type) query.type = type;
    if (status) query.status = status;

    const investments = await Investment.find(query).sort({ createdAt: -1 });

    res.json({ investments });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching investments', error: error.message });
  }
});

// Add investment
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, frequency, expectedReturns, riskLevel } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ message: 'Type and amount are required' });
    }

    const investment = await Investment.create({
      userId: req.userId,
      type,
      amount,
      frequency: frequency || 'monthly',
      expectedReturns,
      riskLevel,
      status: 'active',
    });

    res.status(201).json({ message: 'Investment added', investment });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error adding investment', error: error.message });
  }
});

// Update investment
router.put('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json({ message: 'Investment updated', investment });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating investment', error: error.message });
  }
});

// Delete investment
router.delete('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting investment', error: error.message });
  }
});

module.exports = router;
