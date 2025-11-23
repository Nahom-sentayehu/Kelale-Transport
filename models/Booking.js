const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  seats: [Number],
  passengers: [{
    seat: Number,
    firstName: String,
    middleName: String,
    lastName: String,
    name: String, // Full name for backward compatibility
    phone: String,
    phoneNumber: String, // Alternative field name
    email: String
  }],
  total: Number,
  status: { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'mobile'], default: 'cash' },
  ticketQR: String,
  paymentCode: String // Payment code for customer to use when paying
}, { timestamps: true });
module.exports = mongoose.model('Booking', BookingSchema);
