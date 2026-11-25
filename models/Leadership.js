import mongoose from 'mongoose';

const LeadershipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Leadership title is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Initiative',
      trim: true,
    },
    period: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    icon: {
      type: String,
      default: 'admin_panel_settings',
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
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

LeadershipSchema.index({ order: 1 });
LeadershipSchema.index({ isVisible: 1 });

export default mongoose.models.Leadership || mongoose.model('Leadership', LeadershipSchema);
