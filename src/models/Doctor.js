const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100, index: true },
  specialization: { type: String, required: true, trim: true, maxlength: 100, index: true },
  hospital: { type: String, required: true, trim: true, maxlength: 150 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150, unique: true },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text', email: 'text' });
module.exports = mongoose.model('Doctor', doctorSchema);
