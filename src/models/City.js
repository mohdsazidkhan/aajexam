import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Same district name can occur in more than one state (e.g. "Bilaspur" in both
// Chhattisgarh and Himachal Pradesh), so uniqueness is scoped per state, not global.
citySchema.index({ name: 1, state: 1 }, { unique: true });

export default mongoose.models.City || mongoose.model('City', citySchema);
