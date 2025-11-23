const mongoose = require('mongoose');
const ScheduleSchema = new mongoose.Schema({
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  departure: Date,
  arrival: Date,
  seatsLeft: Number
}, { timestamps: true });
module.exports = mongoose.model('Schedule', ScheduleSchema);
