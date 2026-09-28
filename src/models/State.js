import mongoose from 'mongoose';

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.State || mongoose.model('State', stateSchema);
