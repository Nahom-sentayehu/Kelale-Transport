


const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Route = require('./models/Route');
const Schedule = require('./models/Schedule');
const Company = require('./models/Company');
const auth = require('./middleware/auth');
const { getDistance, getAllCities, cityExists } = require('./utils/cities');

// Configure multer for route bus image uploads
const routeBusImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/route-bus-images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'route-bus-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const routeBusImageUpload = multer({ 
  storage: routeBusImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// search routes with schedules (for customers)
router.get('/', async (req,res)=>{
  try {
    const { from, to, date } = req.query;
    const q = {};
    if(from) q.from = new RegExp(from,'i');
    if(to) q.to = new RegExp(to,'i');
    
    const routes = await Route.find(q).populate('company bus');
    const Rating = require('./models/Rating');
    
    // Get schedules and ratings for each route
    const routesWithSchedules = await Promise.all(
      routes.map(async (route) => {
        const scheduleQuery = { route: route._id };
        if (date) {
          const startDate = new Date(date);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999);
          scheduleQuery.departure = { $gte: startDate, $lte: endDate };
        }
        
        const schedules = await Schedule.find(scheduleQuery)
          .populate('bus')
          .sort({ departure: 1 });
        
        // Get average rating for this route
        const ratings = await Rating.find({ route: route._id });
        const avgRating = ratings.length > 0
          ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10
          : 0;
        const ratingCount = ratings.length;
        
        return {
          ...route.toObject(),
          distance: route.distance || null, // Ensure distance is included
          schedules: schedules.map(s => ({
            _id: s._id,
            departure: s.departure,
            arrival: s.arrival,
            seatsLeft: s.seatsLeft,
            bus: s.bus
          })),
          rating: {
            average: avgRating,
            count: ratingCount
          }
        };
      })
    );
    
    res.json(routesWithSchedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get routes for company (company dashboard)
router.get('/my-routes', auth, async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    const routes = await Route.find({ company: company._id }).populate('company bus');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get all cities
router.get('/cities', (req, res) => {
  try {
    const citiesList = getAllCities();
    res.json(citiesList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get distance between two cities
router.get('/distance', (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'Both from and to cities are required' });
    }
    
    if (!cityExists(from) || !cityExists(to)) {
      return res.status(400).json({ error: 'One or both cities not found' });
    }
    
    const distance = getDistance(from, to);
    res.json({ from, to, distance: distance, unit: 'km' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add route (company only)
router.post('/', auth, routeBusImageUpload.single('busImage'), async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Only company users can create routes' });
    }
    
    // Calculate distance if both cities exist
    let distance = null;
    if (req.body.from && req.body.to) {
      if (cityExists(req.body.from) && cityExists(req.body.to)) {
        distance = getDistance(req.body.from, req.body.to);
      }
    }
    
    // Handle bus image upload
    let busImage = null;
    if (req.file) {
      busImage = `/uploads/route-bus-images/${req.file.filename}`;
    }
    
    const route = new Route({
      ...req.body,
      busImage,
      distance,
      company: company._id,
      bus: req.body.bus || null,
      availableSeats: req.body.availableSeats ? parseInt(req.body.availableSeats) : null
    });
    await route.save();
    await route.populate('company bus');
    res.json(route);
  } catch (err) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting uploaded file:', unlinkErr);
      }
    }
    res.status(500).json({ error: err.message });
  }
});

// update route (company only)
router.put('/:id', auth, routeBusImageUpload.single('busImage'), async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Only company users can update routes' });
    }
    
    const route = await Route.findOne({ _id: req.params.id, company: company._id });
    if (!route) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Route not found' });
    }
    
    // Calculate distance if cities are being updated
    if (req.body.from || req.body.to) {
      const fromCity = req.body.from || route.from;
      const toCity = req.body.to || route.to;
      if (cityExists(fromCity) && cityExists(toCity)) {
        req.body.distance = getDistance(fromCity, toCity);
      }
    }
    
    // Handle bus image upload - if new image provided, delete old one
    if (req.file) {
      if (route.busImage) {
        const oldImagePath = route.busImage.replace('/uploads/', 'uploads/');
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (unlinkErr) {
          console.error('Error deleting old route bus image:', unlinkErr);
        }
      }
      req.body.busImage = `/uploads/route-bus-images/${req.file.filename}`;
    }
    
    if (req.body.bus) route.bus = req.body.bus;
    if (req.body.availableSeats !== undefined) {
      route.availableSeats = req.body.availableSeats ? parseInt(req.body.availableSeats) : null;
    }
    Object.assign(route, req.body);
    await route.save();
    await route.populate('company bus');
    res.json(route);
  } catch (err) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting uploaded file:', unlinkErr);
      }
    }
    res.status(500).json({ error: err.message });
  }
});

// delete route (company only)
router.delete('/:id', auth, async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(403).json({ message: 'Only company users can delete routes' });
    }
    
    const route = await Route.findOne({ _id: req.params.id, company: company._id });
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    await Route.deleteOne({ _id: req.params.id });
    res.json({ message: 'Route deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
