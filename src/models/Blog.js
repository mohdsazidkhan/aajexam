import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
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
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
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
    default: 0
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

// Indexes
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ exam: 1, status: 1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ isFeatured: 1, status: 1 });
blogSchema.index({ isPinned: 1, status: 1 });

// Pre-validate: auto-generate unique slug from title
blogSchema.pre('validate', async function (next) {
  if ((this.isModified('title') || !this.slug) && this.title) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.constructor.findOne({
        slug: slug,
        _id: { $ne: this._id }
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// Pre-save: calculate metrics and timestamps
blogSchema.pre('save', async function (next) {
  if (this.content) {
    this.wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
  }
  if (this.wordCount > 0) {
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  this.lastModifiedAt = new Date();
  next();
});

// Static methods
blogSchema.statics.getPublished = function () {
  return this.find({ status: 'published' })
    .populate('author', 'name email')
    .populate('exam', 'name code')
    .sort({ publishedAt: -1 });
};

blogSchema.statics.getFeatured = function () {
  return this.find({ status: 'published', isFeatured: true })
    .populate('author', 'name email')
    .populate('exam', 'name code')
    .sort({ publishedAt: -1 });
};

blogSchema.statics.getByExam = function (examId) {
  return this.find({ status: 'published', exam: examId })
    .populate('author', 'name email')
    .populate('exam', 'name code')
    .sort({ publishedAt: -1 });
};

blogSchema.statics.search = function (query) {
  return this.find({
    $text: { $search: query },
    status: 'published'
  })
    .populate('author', 'name email')
    .populate('exam', 'name code')
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 });
};

// Instance methods
blogSchema.methods.incrementViews = function () {
  return this.constructor.updateOne({ _id: this._id }, { $inc: { views: 1 } });
};

blogSchema.methods.incrementLikes = function () {
  return this.constructor.updateOne({ _id: this._id }, { $inc: { likes: 1 } });
};

export default mongoose.models?.Blog || mongoose.model('Blog', blogSchema);
