import mongoose from 'mongoose';

const withdrawRequestSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	amount: { type: Number, required: true, min: 1 },
	bankDetails: { type: Object, default: null },
	upi: { type: String, default: null },
	status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending', index: true },
	requestedAt: { type: Date, default: Date.now, index: true },
	processedAt: { type: Date, default: null },
	metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

withdrawRequestSchema.index({ userId: 1, status: 1, requestedAt: -1 });

const WithdrawRequest = mongoose.models.WithdrawRequest || mongoose.model('WithdrawRequest', withdrawRequestSchema);
export default WithdrawRequest;
