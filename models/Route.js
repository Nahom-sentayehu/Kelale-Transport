const mongoose = require('mongoose');
const RouteSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  duration: { type: String },
  distance: { type: Number }, // Distance in kilometers
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' }, // Bus assigned to this route
  price: { type: Number, required: true },
  busImage: { type: String }, // URL or path to bus image for this route
  availableSeats: { type: Number }, // Available seats for this route
}, { timestamps: true });
module.exports = mongoose.model('Route', RouteSchema);
