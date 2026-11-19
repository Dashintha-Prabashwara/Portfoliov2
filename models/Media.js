import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      default: 'banner.png',
      trim: true,
    },
    contentType: {
      type: String,
      default: 'image/png',
      trim: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    // Binary buffer of the image stored directly in MongoDB
    fileData: {
      type: Buffer,
      required: true,
      select: false, // Exclude binary buffer from default queries for speed
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
