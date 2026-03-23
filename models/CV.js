import mongoose from 'mongoose';

const CVSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'CV title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    version: {
      type: String,
      required: [true, 'Version is required'],
      trim: true,
      default: '1.0.0',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
      default: 'Latest CV',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding latest active CV
CVSchema.index({ isActive: 1, uploadedAt: -1 });
CVSchema.index({ version: 1 });

// Method to increment download count
CVSchema.methods.incrementDownload = async function () {
  this.downloadCount += 1;
  return this.save();
};

// Static method to get latest CV
CVSchema.statics.getLatest = function () {
  return this.findOne({ isActive: true }).sort({ uploadedAt: -1 });
};

// Prevent model recompilation in development
export default mongoose.models.CV || mongoose.model('CV', CVSchema);
