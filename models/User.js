const mongoose = require('mongoose');
/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 */
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Keep for backward compatibility
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  profilePhoto: { type: String }, // URL or path to profile photo
  role: { type: String, enum: ['customer','admin','company'], default: 'customer' }
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);
