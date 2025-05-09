import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Hospital',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  role: {
    type: String,
    enum: ['DOCTOR', 'NURSE', 'STAFF'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    default: 'full-day', // e.g., '09:00-13:00', '14:00-18:00'
  },
}, { timestamps: true });

export const Schedule = mongoose.model('Schedule', scheduleSchema);
