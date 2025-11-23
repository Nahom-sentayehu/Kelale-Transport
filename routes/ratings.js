const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Route = require('../models/Route');
const Company = require('../models/Company');
const auth = require('../middleware/auth');

// Get average rating for a route
router.get('/route/:routeId', async (req, res) => {
  try {
    const ratings = await Rating.find({ route: req.params.routeId });
    const average = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
    const count = ratings.length;
    
    res.json({
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      count,
      ratings: ratings.slice(0, 10) // Return latest 10 ratings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get average rating for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const ratings = await Rating.find({ company: req.params.companyId });
    const average = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
    const count = ratings.length;
    
    res.json({
      average: Math.round(average * 10) / 10,
      count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update rating (authenticated users only)
router.post('/', auth, async (req, res) => {
  try {
    const { routeId, rating, comment, bookingId } = req.body;
    
    if (!routeId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid routeId and rating (1-5) are required' });
    }
    
    const route = await Route.findById(routeId).populate('company');
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    // Check if user already rated this route
    const existingRating = await Rating.findOne({ user: req.user.id, route: routeId });
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment || existingRating.comment;
      if (bookingId) existingRating.booking = bookingId;
      await existingRating.save();
      await existingRating.populate('user', 'name');
      return res.json(existingRating);
    } else {
      // Create new rating
      const newRating = new Rating({
        user: req.user.id,
        route: routeId,
        company: route.company._id,
        rating,
        comment: comment || '',
        booking: bookingId || null
      });
      await newRating.save();
      await newRating.populate('user', 'name');
      return res.json(newRating);
    }
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You have already rated this route' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Get user's rating for a route
router.get('/user/route/:routeId', auth, async (req, res) => {
  try {
    const rating = await Rating.findOne({ user: req.user.id, route: req.params.routeId });
    res.json(rating || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all ratings for a route (with user info)
router.get('/route/:routeId/all', async (req, res) => {
  try {
    const ratings = await Rating.find({ route: req.params.routeId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

