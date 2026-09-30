import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Degree / Title is required'],
      trim: true,
    },
    institution: {
      type: String,
      required: [true, 'Institution is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    startDate: {
      type: String,
      default: '',
      trim: true,
    },
    endDate: {
      type: String,
      default: 'PRESENT',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

EducationSchema.virtual('period').get(function () {
  if (!this.startDate) return this.endDate || 'PRESENT';
  return `${this.startDate} - ${this.endDate || 'PRESENT'}`;
});

export default mongoose.models.Education ||
  mongoose.model('Education', EducationSchema);
