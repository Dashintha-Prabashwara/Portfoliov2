import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot be more than 2000 characters'],
    },
    // Honeypot field for spam prevention
    website: {
      type: String,
      default: '',
    },
    // Track IP for rate limiting (optional)
    ipAddress: {
      type: String,
      default: '',
    },
    // Status tracking
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create indexes for better query performance
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ status: 1 });

// Prevent model recompilation in development
export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
