const mongoose = require('mongoose');

// Version control for policy updates
const policyVersionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  version: {
    type: String,
    required: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  title: String,
  description: String,
  changes: [{
    section: String,
    changeType: {
      type: String,
      enum: ['added', 'modified', 'removed']
    },
    description: String
  }],
  content: mongoose.Schema.Types.Mixed,
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  effectiveDate: Date,
  expiryDate: Date,
  requiresRetraining: {
    type: Boolean,
    default: false
  },
  notifiedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for version tracking
policyVersionSchema.index({ course: 1, versionNumber: -1 });
policyVersionSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('PolicyVersion', policyVersionSchema);
