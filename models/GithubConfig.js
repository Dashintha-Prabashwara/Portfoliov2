import mongoose from 'mongoose';

const GithubConfigSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      default: 'Dashintha-Prabashwara',
      trim: true,
    },
    token: {
      type: String,
      default: '',
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    showContributions: {
      type: Boolean,
      default: true,
    },
    showAchievements: {
      type: Boolean,
      default: true,
    },
    showOrganizations: {
      type: Boolean,
      default: true,
    },
    showLanguageStats: {
      type: Boolean,
      default: true,
    },
    showProjectBadges: {
      type: Boolean,
      default: true,
    },
    cachedStats: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.GithubConfig || mongoose.model('GithubConfig', GithubConfigSchema);
