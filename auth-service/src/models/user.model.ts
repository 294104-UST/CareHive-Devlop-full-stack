import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'STAFF', 'PATIENT'],
    required: true,
  },
  hospitalId: {
    type: String,
    required: function (this: any) {
      return this.role !== 'SUPER_ADMIN';
    },
  },
});

export const User = mongoose.model('User', userSchema);
