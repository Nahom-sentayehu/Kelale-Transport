


const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Company = require('../models/Company');
const auth = require('../middleware/auth');

// search routes with schedules (for customers)
router.get('/', async (req,res)=>{
  try {
    const { from, to, date } = req.query;
    const q = {};
    if(from) q.from = new RegExp(from,'i');
    if(to) q.to = new RegExp(to,'i');
    
    const routes = await Route.find(q).populate('company');
    
    // Get schedules for each route
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
        
        return {
          ...route.toObject(),
          schedules: schedules.map(s => ({
            _id: s._id,
            departure: s.departure,
            arrival: s.arrival,
            seatsLeft: s.seatsLeft,
            bus: s.bus
          }))
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
    
    const routes = await Route.find({ company: company._id }).populate('company');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add route (company only)
router.post('/', auth, async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(403).json({ message: 'Only company users can create routes' });
    }
    
    const route = new Route({
      ...req.body,
      company: company._id
    });
    await route.save();
    await route.populate('company');
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update route (company only)
router.put('/:id', auth, async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(403).json({ message: 'Only company users can update routes' });
    }
    
    const route = await Route.findOne({ _id: req.params.id, company: company._id });
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    Object.assign(route, req.body);
    await route.save();
    await route.populate('company');
    res.json(route);
  } catch (err) {
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
