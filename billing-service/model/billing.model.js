const mongoose = require('mongoose');
const { Schema } = mongoose;

const billingSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },

  consultationFee: { type: Number, required: true },
  labTests: [{
    labTestId: { type: Schema.Types.ObjectId, ref: 'LabTest' },
    testName: String,
    cost: Number
  }],

  totalAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },

  paymentDetails: {
    method: String,
    transactionId: String,
    paidOn: Date
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Billing', billingSchema);
