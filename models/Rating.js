const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' } // Optional: link to booking
}, { timestamps: true });

// Prevent duplicate ratings from same user for same route
RatingSchema.index({ user: 1, route: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);

