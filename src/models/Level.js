import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 0,
    max: 100 // Allow up to 100 levels for future expansion
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },

  // Educational content fields for AdSense compliance (Practice Tests Authority Page)
  educationalContent: {
    type: String,
    default: '',
    maxlength: 10000 // Comprehensive educational content (900-1000 words)
  },
  methodology: {
    type: String,
    default: '',
    maxlength: 2000 // How to use practice tests effectively at this level
  },
  examsCovered: [{
    type: String,
    trim: true
  }], // Array of government exams covered at this level
  preparationTips: [{
    type: String,
    trim: true
  }], // Array of preparation tips for this level

  quizzesRequired: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  emoji: {
    type: String,
    default: '🎯',
    maxlength: 10
  },

  // Subscription access control
  requiredSubscription: {
    type: String,
    enum: ['free', 'pro', 'admin'],
    default: 'free'
  },

  // Visual customization
  color: {
    type: String,
    default: '#3B82F6' // Tailwind blue-500
  },
  icon: {
    type: String,
    default: null // Optional icon URL or name
  },

  // Rewards and benefits
  rewards: {
    badge: { type: String, default: null },
    points: { type: Number, default: 0 },
    unlocksFeature: { type: String, default: null }
  },

  // Status and ordering
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0 // For custom ordering if needed
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
levelSchema.index({ levelNumber: 1, isActive: 1 });
levelSchema.index({ order: 1, isActive: 1 });
levelSchema.index({ quizzesRequired: 1 });

// Static method to get all active levels sorted by level number
levelSchema.statics.getActiveLevels = async function () {
  return this.find({ isActive: true }).sort({ levelNumber: 1 });
};

// Static method to get level config object (for backward compatibility)
levelSchema.statics.getLevelConfig = async function () {
  const levels = await this.find({ isActive: true }).sort({ levelNumber: 1 });
  const config = {};

  levels.forEach(level => {
    config[level.levelNumber] = {
      name: level.name,
      description: level.description,
      quizzesRequired: level.quizzesRequired,
      emoji: level.emoji,
      color: level.color,
      requiredSubscription: level.requiredSubscription
    };
  });

  return config;
};

// Static method to get level by number
levelSchema.statics.getLevelByNumber = async function (levelNumber) {
  return this.findOne({ levelNumber, isActive: true });
};

// Instance method to get next level
levelSchema.methods.getNextLevel = async function () {
  return this.constructor.findOne({
    levelNumber: { $gt: this.levelNumber },
    isActive: true
  }).sort({ levelNumber: 1 });
};

// Instance method to get previous level
levelSchema.methods.getPreviousLevel = async function () {
  return this.constructor.findOne({
    levelNumber: { $lt: this.levelNumber },
    isActive: true
  }).sort({ levelNumber: -1 });
};

const Level = mongoose.models.Level || mongoose.model('Level', levelSchema);

// Ensure static methods are present even if model was already registered (hot reloading fix)
if (Level) {
  Level.getLevelConfig = levelSchema.statics.getLevelConfig;
  Level.getActiveLevels = levelSchema.statics.getActiveLevels;
  Level.getLevelByNumber = levelSchema.statics.getLevelByNumber;

  // Instance methods
  Level.prototype.getNextLevel = levelSchema.methods.getNextLevel;
  Level.prototype.getPreviousLevel = levelSchema.methods.getPreviousLevel;
}

export default Level;


