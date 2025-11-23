const mongoose = require('mongoose');
const RouteSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  duration: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  price: { type: Number, required: true },
}, { timestamps: true });
module.exports = mongoose.model('Route', RouteSchema);
