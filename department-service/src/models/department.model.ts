import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  hospitalId: mongoose.Types.ObjectId;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true },
    hospitalId: { type: Schema.Types.ObjectId, required: true, ref: 'Hospital' },
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
