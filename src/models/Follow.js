import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' }
}, { timestamps: true });

followSchema.index({ follower: 1, following: 1 }, { unique: true });

export default mongoose.models.Follow || mongoose.model('Follow', followSchema);
