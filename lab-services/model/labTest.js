const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  cost: { type: Number },
  isActive: { type: Boolean, default: true } // Only active tests will be shown
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);
