import mongoose from 'mongoose';

const nurseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }, // Department ObjectId from Department Service
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }, // Hospital ID from token
  password: { type: String, required: true, select: false }, // password, excluded by default
  available: {
    type: Boolean,
    default: true // Nurses are assumed to be available unless explicitly on leave
  },
  leaveDates: {
    type: [Date], // Array of leave dates
    default: []
  },
  scheduledDates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    default: []
  }],
}, { timestamps: true });

export const Nurse = mongoose.model('Nurse', nurseSchema);
