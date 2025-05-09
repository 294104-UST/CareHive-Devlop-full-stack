// models/Hospital.ts
import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  description: String,
}, { timestamps: true });

export default mongoose.model('Hospital', hospitalSchema);
