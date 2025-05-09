import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Department'  // Add reference to Department model
  },
  hospitalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  password: { type: String, required: true, select: false },
  specialization: { type: String, required: true },
  available: {
    type: Boolean,
    default: true,
  },
  leaveDates: {
    type: [Date],
    default: [],
  },
  scheduledDates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    default: []
  }],
}, { timestamps: true });

export const Doctor = mongoose.model('Doctor', doctorSchema);
