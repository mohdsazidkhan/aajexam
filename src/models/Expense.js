import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Please add a title'], trim: true },
    amount: { type: Number, required: [true, 'Please add an amount'] },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['ads', 'server', 'maintenance', 'marketing', 'other'],
        default: 'other'
    },
    date: { type: Date, default: Date.now },
    description: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
