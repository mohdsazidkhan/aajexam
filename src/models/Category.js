import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },

  // Educational content fields for AdSense compliance
  longDescription: {
    type: String,
    default: '',
    maxlength: 3000 // Detailed educational description (300+ words)
  },
  educationalValue: {
    type: String,
    default: '',
    maxlength: 1000 // What educational value this category provides
  },
  targetAudience: {
    type: String,
    default: '',
    maxlength: 500 // Who should take quizzes in this category
  },

  // Creator tracking fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdType: { type: String, enum: ['admin', 'user'], default: 'admin' },

  // Approval status (admin categories are auto-approved, user categories need approval)
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  adminNotes: { type: String }, // Admin approval/rejection notes
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes for efficient queries
categorySchema.index({ createdBy: 1, createdType: 1, status: 1 });
categorySchema.index({ status: 1, createdAt: -1 });

const Category = mongoose.models?.Category || mongoose.model('Category', categorySchema);
export default Category;
