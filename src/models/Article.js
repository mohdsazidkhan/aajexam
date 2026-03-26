import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 500,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    trim: true,
    maxlength: 100,
    default: '' // Display name for author (for SEO and public display)
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'published', 'archived', 'rejected'],
    default: 'draft'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featuredImage: {
    type: String,
    default: null
  },
  featuredImageAlt: {
    type: String,
    default: ''
  },
  metaTitle: {
    type: String,
    maxlength: 60,
    trim: true
  },
  metaDescription: {
    type: String,
    maxlength: 160,
    trim: true
  },
  readingTime: {
    type: Number,
    default: 0 // in minutes
  },
  wordCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  rewardTier: {
    type: String,
    enum: ['normal', 'good', 'high'],
    default: 'normal'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ isFeatured: 1, status: 1 });
articleSchema.index({ isPinned: 1, status: 1 });
// Note: slug unique index is already created by the unique: true in the schema field definition

// Virtual for formatted published date
articleSchema.virtual('formattedPublishedAt').get(function () {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for reading time calculation
articleSchema.virtual('estimatedReadingTime').get(function () {
  if (this.wordCount === 0) return 0;
  const wordsPerMinute = 200; // Average reading speed
  return Math.ceil(this.wordCount / wordsPerMinute);
});

// Pre-validate: ensure slug exists/unique based on title before required validations
articleSchema.pre('validate', async function (next) {
  if ((this.isModified('title') || !this.slug) && this.title) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingArticle = await this.constructor.findOne({
        slug: slug,
        _id: { $ne: this._id } // Exclude current document when updating
      });

      if (!existingArticle) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  next();
});

// Pre-save middleware to calculate metrics and timestamps
articleSchema.pre('save', async function (next) {

  // Calculate word count
  if (this.content) {
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Calculate reading time
  if (this.wordCount > 0) {
    this.readingTime = Math.ceil(this.wordCount / 200); // 200 words per minute
  }

  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Update lastModifiedAt
  this.lastModifiedAt = new Date();

  next();
});

// Static method to get published articles
articleSchema.statics.getPublished = function () {
  return this.find({ status: 'published' })
    .populate('author', 'name email')
    .populate('category', 'name')
    .sort({ publishedAt: -1 });
};

// Static method to get featured articles
articleSchema.statics.getFeatured = function () {
  return this.find({
    status: 'published',
    isFeatured: true
  })
    .populate('author', 'name email')
    .populate('category', 'name')
    .sort({ publishedAt: -1 });
};

// Static method to get articles by category
articleSchema.statics.getByCategory = function (categoryId) {
  return this.find({
    status: 'published',
    category: categoryId
  })
    .populate('author', 'name email')
    .populate('category', 'name')
    .sort({ publishedAt: -1 });
};

// Static method to search articles
articleSchema.statics.search = function (query) {
  return this.find({
    $text: { $search: query },
    status: 'published'
  })
    .populate('author', 'name email')
    .populate('category', 'name')
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 });
};

// Instance method to increment views without triggering full validation
articleSchema.methods.incrementViews = function () {
  return this.constructor
    .updateOne({ _id: this._id }, { $inc: { views: 1 } })
    .then(() => {
      this.views = (this.views || 0) + 1;
      return this;
    });
};

// Instance method to increment likes without triggering full validation
articleSchema.methods.incrementLikes = function () {
  return this.constructor
    .updateOne({ _id: this._id }, { $inc: { likes: 1 } })
    .then(() => {
      this.likes = (this.likes || 0) + 1;
      return this;
    });
};

export default mongoose.models?.Article || mongoose.model('Article', articleSchema);
