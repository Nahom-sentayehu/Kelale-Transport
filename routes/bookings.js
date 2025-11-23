const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');
const qrcodeUtil = require('../utils/qrcode');

// create booking (checks seat availability if schedule provided)
router.post('/', auth, async (req,res)=>{
  try{
    const { routeId, busId, seats, scheduleId } = req.body;
    if(!routeId || !busId || !seats || seats.length===0) return res.status(400).json({msg:'Missing booking data'});
    const route = await Route.findById(routeId).populate('company');
    const bus = await Bus.findById(busId);
    if(!route || !bus) return res.status(400).json({msg:'Invalid route or bus'});

    // if scheduleId provided, check seatsLeft and existing bookings for that schedule
    if(scheduleId){
      const schedule = await Schedule.findById(scheduleId);
      if(!schedule) return res.status(400).json({msg:'Invalid schedule'});
      // simple seatsLeft check
      if(typeof schedule.seatsLeft === 'number' && schedule.seatsLeft < seats.length){
        return res.status(400).json({msg:'Not enough seats available on this schedule'});
      }
      // reduce seatsLeft
      schedule.seatsLeft = (schedule.seatsLeft || bus.seats) - seats.length;
      await schedule.save();
    }

    // check for conflicting bookings on same bus & schedule (basic check)
    const conflicts = await Booking.find({ bus: busId, status: { $in: ['confirmed'] } });
    for(const c of conflicts){
      for(const s of c.seats){
        if(seats.includes(s)) return res.status(400).json({msg:`Seat ${s} already booked`});
      }
    }

    const total = (route.price || 0) * (seats.length || 1);
    const booking = new Booking({
      user: req.user.id,
      route: route._id,
      bus: bus._id,
      seats,
      total,
      status: 'confirmed'
    });
    // generate QR data url
    const qrData = `booking:${booking._id.toString()};user:${req.user.id};route:${route.from}->${route.to}`;
    const qr = await qrcodeUtil.generate(qrData);
    booking.ticketQR = qr;
    await booking.save();
    res.json({booking, qr});
  }catch(e){ console.error(e); res.status(500).json({msg:'Server error'}); }
});

// get bookings for logged in user
router.get('/user', auth, async (req,res)=>{
  const bookings = await Booking.find({user: req.user.id}).populate('route bus');
  res.json(bookings);
});

module.exports = router;
