const express = require("express");
const router = express.Router();
const Booking = require('../models/Booking');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');
const qrcodeUtil = require('../utils/qrcode');

// create booking (checks seat availability if schedule provided)
router.post('/', auth, async (req, res) => {
  try {
    const { routeId, busId, seats, scheduleId, paymentMethod, passengers } = req.body;
    if (!routeId || !busId || !seats || seats.length === 0) {
      return res.status(400).json({ msg: 'Missing booking data' });
    }
    
    const route = await Route.findById(routeId).populate('company');
    const bus = await Bus.findById(busId);
    if (!route || !bus) {
      return res.status(400).json({ msg: 'Invalid route or bus' });
    }

    // if scheduleId provided, check seatsLeft and existing bookings for that schedule
    if (scheduleId) {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) {
        return res.status(400).json({ msg: 'Invalid schedule' });
      }
      // simple seatsLeft check
      if (typeof schedule.seatsLeft === 'number' && schedule.seatsLeft < seats.length) {
        return res.status(400).json({ msg: 'Not enough seats available on this schedule' });
      }
      // reduce seatsLeft
      schedule.seatsLeft = (schedule.seatsLeft || bus.seats) - seats.length;
      await schedule.save();
    }

    // check for conflicting bookings on same bus & schedule (basic check)
    const conflicts = await Booking.find({ bus: busId, status: { $in: ['confirmed'] } });
    for (const c of conflicts) {
      for (const s of c.seats) {
        if (seats.includes(s)) {
          return res.status(400).json({ msg: `Seat ${s} already booked` });
        }
      }
    }

    const total = (route.price || 0) * (seats.length || 1);
    
    // Generate unique payment code (format: PAY-XXXXXX where X is alphanumeric)
    const generatePaymentCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'PAY-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    const paymentCode = generatePaymentCode();
    
    const booking = new Booking({
      user: req.user.id,
      route: route._id,
      bus: bus._id,
      seats,
      passengers: passengers || [],
      total,
      status: 'pending', // Booking pending payment
      paymentMethod: paymentMethod || 'cash',
      paymentCode: paymentCode
    });
    
    // generate QR data url
    const qrData = `booking:${booking._id.toString()};user:${req.user.id};route:${route.from}->${route.to};seats:${seats.join(',')};total:${total};paymentCode:${paymentCode}`;
    const qr = await qrcodeUtil.generate(qrData);
    booking.ticketQR = qr;
    await booking.save();
    
    // Populate route and bus for response
    await booking.populate('route bus');
    await booking.route.populate('company');
    
    res.json({ booking, qr, paymentCode });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error', error: e.message });
  }
});

// get bookings for logged in user
router.get('/user', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('route bus')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// get all bookings (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }
    const bookings = await Booking.find()
      .populate('route bus user')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// get bookings for company (company dashboard)
router.get('/company', auth, async (req, res) => {
  try {
    const Company = require('../models/Company');
    const Route = require('../models/Route');
    
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    // Get all routes for this company
    const routes = await Route.find({ company: company._id });
    const routeIds = routes.map(r => r._id);
    
    // Get all bookings for these routes
    const bookings = await Booking.find({ route: { $in: routeIds } })
      .populate('route bus user')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error', error: e.message });
  }
});

module.exports = router;
