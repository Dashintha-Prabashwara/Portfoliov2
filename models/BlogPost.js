import mongoose from 'mongoose';

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'DevOps & CI/CD',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    readTime: {
      type: String,
      default: '5 min read',
      trim: true,
    },
    coverImage: {
      type: String,
      default: '',
      trim: true,
    },
    author: {
      type: String,
      default: 'Dashintha Jayawardana',
      trim: true,
    },
    externalUrl: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      default: 'Published',
      trim: true,
    },
    color: {
      type: String,
      enum: ['primary', 'secondary', 'tertiary'],
      default: 'primary',
    },
    order: {
      type: Number,
      default: 0,
    },
    blogPostId: {
      type: Number,
      index: true,
      sparse: true,
    },
    syncSource: {
      type: String,
      default: 'tidb',
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from title before save if not present
BlogPostSchema.pre('save', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
