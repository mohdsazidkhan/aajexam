import mongoose from 'mongoose';
const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, default: '' },

  // Creator tracking fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdType: { type: String, enum: ['admin', 'user'], default: 'admin' },

  // Approval status (admin subcategories are auto-approved, user subcategories need approval)
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
subcategorySchema.index({ createdBy: 1, createdType: 1, status: 1 });
subcategorySchema.index({ status: 1, createdAt: -1 });
subcategorySchema.index({ category: 1, status: 1 });

const Subcategory = mongoose.models?.Subcategory || mongoose.model('Subcategory', subcategorySchema);
export default Subcategory;
