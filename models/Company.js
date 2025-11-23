const mongoose = require('mongoose');
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  contact: { type: String },
  logo: { type: String }, // URL or path to company logo
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assigned company user
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Company', CompanySchema);
