import mongoose from 'mongoose';

const CvSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Dashintha Jayawardana - CV',
      trim: true,
    },
    fileUrl: {
      type: String,
      default: '/api/cv/download',
      trim: true,
    },
    description: {
      type: String,
      default: 'Professional CV and Resume',
      trim: true,
    },
    // Binary PDF file content stored directly in MongoDB
    fileData: {
      type: Buffer,
      select: false, // Exclude from default queries for high performance
    },
    contentType: {
      type: String,
      default: 'application/pdf',
    },
    fileName: {
      type: String,
      default: 'cv.pdf',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    downloadsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: String,
      default: '1.0',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Cv || mongoose.model('Cv', CvSchema);
