const mongoose = require('mongoose');
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100, index: true },
  age: { type: Number, required: true, min: 0, max: 120 },
  gender: { type: String, enum: ['Female', 'Male', 'Other'], required: true },
  condition: { type: String, required: true, trim: true, maxlength: 150, index: true },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
patientSchema.index({ name: 'text', condition: 'text', phone: 'text' });
module.exports = mongoose.model('Patient', patientSchema);
