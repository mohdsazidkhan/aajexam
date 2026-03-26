import mongoose from 'mongoose';

const homePageSchema = new mongoose.Schema({
    platformPurpose: { type: String, required: true, maxlength: 2000 },
    targetAudience: { type: String, required: true, maxlength: 1000 },
    educationalBenefits: { type: String, required: true, maxlength: 2000 },
    learningMethodology: { type: String, required: true, maxlength: 2000 },
    keyFeatures: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, default: '' }
    }],
    successStories: [{
        studentName: { type: String, required: true },
        achievement: { type: String, required: true },
        testimonial: { type: String, required: true }
    }],
    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
}, { timestamps: true });

homePageSchema.statics.getActiveContent = async function () {
    return this.findOne({ isActive: true }).sort({ version: -1 }).lean();
};

const HomePage = mongoose.models.HomePage || mongoose.model('HomePage', homePageSchema);
export default HomePage;
