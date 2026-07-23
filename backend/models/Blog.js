// models/Blog.js
// Mongoose schema for saved blog posts

const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
  {
    // The topic/title the user requested
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      maxlength: [200, 'Topic cannot exceed 200 characters'],
    },

    // The generated blog content
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [50, 'Content must be at least 50 characters'],
    },

    // Writing tone: professional, casual, academic, creative, persuasive
    tone: {
      type: String,
      required: [true, 'Tone is required'],
      enum: {
        values: ['professional', 'casual', 'academic', 'creative', 'persuasive'],
        message: '{VALUE} is not a valid tone',
      },
      default: 'professional',
    },

    // Approximate word count requested
    wordCount: {
      type: Number,
      required: [true, 'Word count is required'],
      min: [100, 'Word count must be at least 100'],
      max: [2000, 'Word count cannot exceed 2000'],
      default: 500,
    },

    // Optional SEO keywords
    seoKeywords: {
      type: [String],
      default: [],
    },

    // AI Cover Image URL
    coverImage: {
      type: String,
      default: null,
    },

    // Target Language
    language: {
      type: String,
      default: 'English',
    },

    // AI Model used for generation
    modelUsed: {
      type: String,
      default: 'mistralai/Mistral-7B-Instruct-v0.2',
    },

    // Blog Outline (if generated step-by-step)
    outline: {
      type: [String],
      default: [],
    },

    // Whether this was humanized/rewritten
    isHumanized: {
      type: Boolean,
      default: false,
    },

    // Original content before humanization (if applicable)
    originalContent: {
      type: String,
      default: null,
    },

    // User who created this blog (if auth is enabled)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Track if user starred/favorited this blog
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Auto-add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Index for faster queries
BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ userId: 1, createdAt: -1 });

// Virtual: estimated reading time (avg 200 words/min)
BlogSchema.virtual('readingTime').get(function () {
  const words = this.content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
});

// Ensure virtuals are included when converting to JSON
BlogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Blog', BlogSchema);
