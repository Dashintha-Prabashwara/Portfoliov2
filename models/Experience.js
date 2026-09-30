import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role/Position is required'],
      trim: true,
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
      trim: true,
    },
    endDate: {
      type: String,
      default: 'Present',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    tags: {
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
    align: {
      type: String,
      enum: ['left', 'right', 'auto'],
      default: 'auto',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ExperienceSchema.virtual('period').get(function () {
  return `${this.startDate} - ${this.endDate || 'Present'}`;
});

export default mongoose.models.Experience ||
  mongoose.model('Experience', ExperienceSchema);
