const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConsultationSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  nurseId: { type: Schema.Types.ObjectId, ref: 'Nurse' },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  vitals: {
    height: { type: String },
    weight: { type: String },
    bp: { type: String },
    temp: { type: String }
  },
  diagnosis: { type: String },
  prescription: [{
    medicineName: String,
    days: Number,
    timesPerDay: Number,
    beforeOrAfterFood: String
  }],
  labTests: [{ type: Schema.Types.ObjectId, ref: 'LabTest' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Consultation', ConsultationSchema);
