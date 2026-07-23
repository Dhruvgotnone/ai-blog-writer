// routes/admin.js
// Admin dashboard endpoints for user management & system metrics

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Blog = require('../models/Blog');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/admin/stats
 * Return overall platform metrics
 */
router.get('/stats', optionalAuth, async (req, res) => {
  try {
    const [totalUsers, totalBlogs, proUsers, aggregateCredits] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      User.countDocuments({ tier: { $ne: 'free' } }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$credits' } } }]),
    ]);

    const totalCredits = aggregateCredits[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBlogs,
        proUsers,
        totalCredits,
        systemStatus: 'Operational',
        huggingFaceModel: 'mistralai/Mistral-7B-Instruct-v0.2',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch admin stats.' });
  }
});

/**
 * GET /api/admin/users
 * List all users with pagination
 */
router.get('/users', optionalAuth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users.' });
  }
});

/**
 * PATCH /api/admin/users/:id/credits
 * Update a user's credit balance
 */
router.patch('/users/:id/credits', optionalAuth, async (req, res) => {
  const { credits, tier } = req.body;

  try {
    const updateObj = {};
    if (typeof credits === 'number') updateObj.credits = credits;
    if (tier) updateObj.tier = tier;

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updateObj }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    res.json({ success: true, data: user, message: 'User updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user.' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user account
 */
router.delete('/users/:id', optionalAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user.' });
  }
});

module.exports = router;
