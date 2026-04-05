import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true }, // Cloudinary URL
  resourceType: { 
    type: String, 
    enum: ['pdf', 'video', 'article'], 
    default: 'pdf' 
  },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  examType: { type: String, default: 'General' }, // Target exam (e.g. SSC, UPSC)
  isFree: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

studyMaterialSchema.index({ subject: 1, topic: 1 });
studyMaterialSchema.index({ examType: 1, isActive: 1 });

const StudyMaterial = mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', studyMaterialSchema);
export default StudyMaterial;
