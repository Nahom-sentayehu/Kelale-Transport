const mongoose = require('mongoose');
const BusSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  plate: String,
  seats: Number,
  type: { type: String, enum: ['VIP','Standard'], default: 'Standard'},
  image: { type: String } // URL or path to bus image
}, { timestamps: true });
module.exports = mongoose.model('Bus', BusSchema);
