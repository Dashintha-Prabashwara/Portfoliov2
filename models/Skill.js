import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Skill title is required'],
      trim: true,
    },
    icon: {
      type: String,
      default: 'terminal',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
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

SkillSchema.index({ order: 1 });
SkillSchema.index({ isVisible: 1 });

export default mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
