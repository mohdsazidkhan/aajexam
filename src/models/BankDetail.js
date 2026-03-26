import mongoose from 'mongoose';

const bankDetailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accountHolderName: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  ifscCode: {
    type: String,
    required: true,
    trim: true
  },
  branchName: {
    type: String,
    required: true,
    trim: true
  },
  upiId: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const BankDetail = mongoose.models.BankDetail || mongoose.model('BankDetail', bankDetailSchema);
export default BankDetail;
