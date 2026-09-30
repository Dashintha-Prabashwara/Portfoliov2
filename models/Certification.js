import mongoose from 'mongoose';

const CertificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Certification title is required'],
      trim: true,
    },
    organization: {
      type: String,
      required: [true, 'Organization is required'],
      trim: true,
    },
    credentialId: {
      type: String,
      default: '',
      trim: true,
    },
    icon: {
      type: String,
      default: 'verified',
      trim: true,
    },
    status: {
      type: String,
      default: 'Verified',
      trim: true,
    },
    statusColor: {
      type: String,
      default: 'tertiary',
      trim: true,
    },
    issueDate: {
      type: String,
      default: '',
      trim: true,
    },
    expiryDate: {
      type: String,
      default: '',
      trim: true,
    },
    verificationUrl: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Certification ||
  mongoose.model('Certification', CertificationSchema);
