const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Insurance = require('../models/Insurance');
const User = require('../models/User');
const { generateInsuranceRecommendations } = require('../services/aiService');

// Get insurance recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.salary) {
      return res
        .status(400)
        .json({ message: 'Please setup your salary first' });
    }

    const recommendations = await generateInsuranceRecommendations(
      user.salary,
      user.age,
      user.familyMembers
    );

    // Save recommendations
    for (let rec of recommendations) {
      await Insurance.findOneAndUpdate(
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

// Get all insurance policies
router.get('/', auth, async (req, res) => {
  try {
    const { type, status } = req.query;

    const query = { userId: req.userId };
    if (type) query.type = type;
    if (status) query.status = status;

    const insurances = await Insurance.find(query).sort({ createdAt: -1 });

    res.json({ insurances });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching insurance', error: error.message });
  }
});

// Add insurance policy
router.post('/', auth, async (req, res) => {
  try {
    const { type, coverage, premium, duration, provider } = req.body;

    if (!type || !coverage || !premium) {
      return res
        .status(400)
        .json({ message: 'Type, coverage, and premium are required' });
    }

    const insurance = await Insurance.create({
      userId: req.userId,
      type,
      coverage,
      premium,
      duration,
      provider,
      status: 'active',
    });

    res.status(201).json({ message: 'Insurance policy added', insurance });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error adding insurance', error: error.message });
  }
});

// Update insurance status
router.put('/:id', auth, async (req, res) => {
  try {
    const insurance = await Insurance.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
    }

    res.json({ message: 'Insurance updated', insurance });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating insurance', error: error.message });
  }
});

// Delete insurance
router.delete('/:id', auth, async (req, res) => {
  try {
    const insurance = await Insurance.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
    }

    res.json({ message: 'Insurance deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting insurance', error: error.message });
  }
});

module.exports = router;
