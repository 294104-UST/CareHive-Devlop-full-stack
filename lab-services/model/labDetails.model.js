const mongoose = require('mongoose');

const testDetailsSchema = new mongoose.Schema({
  testName: {type: mongoose.Schema.Types.ObjectId, ref: 'LabTest', required: true},//{ type: String, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  resultFileUrl: { type: String },
  remarks: { type: String }
});

const labSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  testDetails: [testDetailsSchema],
  orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // doctor
  uploadedBy: { type: mongoose.Schema.Types.ObjectId }, // lab tech (optional)
}, { timestamps: true });

module.exports = mongoose.model('Lab', labSchema);
