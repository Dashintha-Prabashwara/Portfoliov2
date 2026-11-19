import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    liveUrl: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      default: 'Active',
      trim: true,
    },
    statusColor: {
      type: String,
      enum: ['primary', 'secondary', 'tertiary', 'warning', 'error', ''],
      default: 'primary',
    },
    barColor: {
      type: String,
      enum: [
        'from-primary to-primary',
        'from-secondary to-secondary',
        'from-tertiary to-tertiary',
      ],
      default: 'from-primary to-primary',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
