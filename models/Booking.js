const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  seats: [Number],
  total: Number,
  status: { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' },
  ticketQR: String
}, { timestamps: true });
module.exports = mongoose.model('Booking', BookingSchema);
