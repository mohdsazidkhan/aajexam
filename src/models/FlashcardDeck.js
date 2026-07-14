import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
    content: { type: String, required: true }, // HTML/Markdown allowed
    image: { type: String }, // Optional image URL
    backgroundColor: { type: String, default: 'bg-gradient-to-br from-indigo-500 to-purple-600' } // Tailwind classes for card background
});

const flashcardDeckSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }, // Optional, if deck is specific to an exam
    cards: [flashcardSchema],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String, lowercase: true, trim: true }]
}, { timestamps: true });

flashcardDeckSchema.index({ subject: 1, status: 1 });
flashcardDeckSchema.index({ topic: 1, status: 1 });
flashcardDeckSchema.index({ slug: 1 });

export default mongoose.models.FlashcardDeck || mongoose.model('FlashcardDeck', flashcardDeckSchema);
