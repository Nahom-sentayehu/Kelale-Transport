const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Company = require('../models/Company');
const Bus = require('../models/Bus');
const auth = require('../middleware/auth');

// get schedules for a route
router.get('/route/:routeId', async (req,res)=>{
  try {
    const schedules = await Schedule.find({ route: req.params.routeId })
      .populate('route bus')
      .sort({ departure: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get my company schedules (company dashboard)
router.get('/my-schedules', auth, async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    const routes = await Route.find({ company: company._id });
    const routeIds = routes.map(r => r._id);
    
    const schedules = await Schedule.find({ route: { $in: routeIds } })
      .populate('route bus')
      .sort({ departure: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create schedule (company only)
router.post('/', auth, async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(403).json({ message: 'Only company users can create schedules' });
    }
    
    const { routeId, busId, departure, arrival } = req.body;
    
    // Verify route belongs to company
    const route = await Route.findOne({ _id: routeId, company: company._id });
    if (!route) {
      return res.status(403).json({ message: 'Route not found or does not belong to your company' });
    }
    
    // Verify bus belongs to company
    const bus = await Bus.findOne({ _id: busId, company: company._id });
    if (!bus) {
      return res.status(403).json({ message: 'Bus not found or does not belong to your company' });
    }
    
    const schedule = new Schedule({
      route: routeId,
      bus: busId,
      departure: new Date(departure),
      arrival: new Date(arrival),
      seatsLeft: bus.seats
    });
    await schedule.save();
    await schedule.populate('route bus');
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update schedule (company only)
router.put('/:id', auth, async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(403).json({ message: 'Only company users can update schedules' });
    }
    
    const schedule = await Schedule.findById(req.params.id).populate('route');
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    const route = await Route.findById(schedule.route._id);
    if (route.company.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Schedule does not belong to your company' });
    }
    
    Object.assign(schedule, req.body);
    if (req.body.departure) schedule.departure = new Date(req.body.departure);
    if (req.body.arrival) schedule.arrival = new Date(req.body.arrival);
    await schedule.save();
    await schedule.populate('route bus');
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete schedule (company only)
router.delete('/:id', auth, async (req,res)=>{
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(403).json({ message: 'Only company users can delete schedules' });
    }
    
    const schedule = await Schedule.findById(req.params.id).populate('route');
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    const route = await Route.findById(schedule.route._id);
    if (route.company.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Schedule does not belong to your company' });
    }
    
    await Schedule.deleteOne({ _id: req.params.id });
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
