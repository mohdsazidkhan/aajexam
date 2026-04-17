import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    examDate: { type: Date, required: true },
    dailyHours: { type: Number, required: true, min: 1, max: 16 },
    weakSubjects: [{ type: String, trim: true }],
    strongSubjects: [{ type: String, trim: true }],
    totalDays: { type: Number, default: 0 },
    weeklySchedule: [{
        week: { type: Number, required: true },
        startDate: { type: Date },
        endDate: { type: Date },
        tasks: [{
            day: { type: Number, required: true },
            subject: { type: String, required: true },
            topic: { type: String, required: true },
            duration: { type: Number, required: true },
            taskType: { type: String, enum: ['study', 'practice', 'revision', 'mock_test'], required: true },
            description: { type: String, default: '' },
            isCompleted: { type: Boolean, default: false },
            completedAt: { type: Date }
        }]
    }],
    dailyTasks: [{
        date: { type: Date, required: true },
        tasks: [{
            subject: { type: String, required: true },
            topic: { type: String, required: true },
            duration: { type: Number, required: true },
            taskType: { type: String, enum: ['study', 'practice', 'revision', 'mock_test'], required: true },
            description: { type: String, default: '' },
            isCompleted: { type: Boolean, default: false },
            completedAt: { type: Date }
        }]
    }],
    generatedBy: { type: String, enum: ['ai', 'template', 'admin'], default: 'ai' },
    aiModel: { type: String, default: '' },
    completionPercentage: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'paused', 'completed', 'expired'], default: 'active' }
}, { timestamps: true });

studyPlanSchema.index({ user: 1, isActive: 1 });
studyPlanSchema.index({ user: 1, exam: 1 });
studyPlanSchema.index({ status: 1 });

export default mongoose.models.StudyPlan || mongoose.model('StudyPlan', studyPlanSchema);
