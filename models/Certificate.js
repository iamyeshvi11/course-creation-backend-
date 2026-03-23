const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C', 'Pass'],
    required: true
  },
  validUntil: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  metadata: {
    completionTime: Number, // hours
    attempts: Number,
    moduleCount: Number
  }
}, {
  timestamps: true
});

// Generate certificate number
certificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.certificateNumber = `CERT-${year}-${random}-${this._id.toString().slice(-4).toUpperCase()}`;
  }
  next();
});

// Calculate grade based on score
certificateSchema.methods.calculateGrade = function() {
  if (this.score >= 95) return 'A+';
  if (this.score >= 90) return 'A';
  if (this.score >= 85) return 'B+';
  if (this.score >= 80) return 'B';
  if (this.score >= 70) return 'C';
  return 'Pass';
};

// Check if certificate is valid
certificateSchema.methods.isValid = function() {
  if (this.status !== 'active') return false;
  if (this.validUntil && new Date() > this.validUntil) return false;
  return true;
};

// Indexes
certificateSchema.index({ user: 1, course: 1 });
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ issuedDate: -1 });

module.exports = mongoose.model('Certificate', certificateSchema);
