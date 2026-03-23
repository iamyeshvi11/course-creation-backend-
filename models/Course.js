const mongoose = require('mongoose');

// Question Schema for quiz
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: 0
  },
  explanation: {
    type: String,
    trim: true
  }
}, { _id: true });

// Content Block Schema (supports text, video, PDF, images)
const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'video', 'pdf', 'image', 'audio', 'embed'],
    default: 'text',
    required: true
  },
  content: {
    type: String, // Text content or URL
    required: true
  },
  title: {
    type: String,
    trim: true
  },
  duration: {
    type: Number // Duration in seconds (for videos/audio)
  },
  fileUrl: {
    type: String // File URL for uploaded content
  },
  thumbnailUrl: {
    type: String // Thumbnail for videos
  },
  metadata: {
    fileSize: Number, // in bytes
    mimeType: String,
    uploadedBy: String, // User ID as string (more flexible)
    uploadedAt: Date
  }
}, { _id: true });

// Module Schema
const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true
  },
  contentBlocks: [contentBlockSchema],
  quiz: [questionSchema]
}, { _id: true });

// Course Schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingCategory'
  },
  categoryCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  isMandatory: {
    type: Boolean,
    default: false
  },
  riskLevel: {
    type: String,
    required: [true, 'Risk level is required'],
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: '{VALUE} is not a valid risk level. Must be Low, Medium, or High'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Course creator (admin) reference is required']
  },
  modules: [moduleSchema],
  passThreshold: {
    type: Number,
    required: [true, 'Pass threshold is required'],
    min: [0, 'Pass threshold must be at least 0'],
    max: [100, 'Pass threshold cannot exceed 100'],
    default: 70
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 60
  },
  tags: [{
    type: String,
    trim: true
  }],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // This adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
courseSchema.index({ title: 1 });
courseSchema.index({ riskLevel: 1 });
courseSchema.index({ createdBy: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ category: 1 });
courseSchema.index({ categoryCode: 1 });
courseSchema.index({ isMandatory: 1 });
courseSchema.index({ tags: 1 });

// Virtual for total number of modules
courseSchema.virtual('moduleCount').get(function() {
  return this.modules.length;
});

// Virtual for total number of questions across all modules
courseSchema.virtual('totalQuestions').get(function() {
  return this.modules.reduce((total, module) => {
    return total + (module.quiz ? module.quiz.length : 0);
  }, 0);
});

// Instance method to check if user can access this course based on risk level
courseSchema.methods.canUserAccess = function(userRiskLevel) {
  const riskLevels = { 'Low': 1, 'Medium': 2, 'High': 3 };
  return riskLevels[userRiskLevel] >= riskLevels[this.riskLevel];
};

// Static method to get courses by risk level
courseSchema.statics.getCoursesByRiskLevel = function(riskLevel) {
  return this.find({ riskLevel }).populate('createdBy', 'name email');
};

// Static method to get courses created by a specific admin
courseSchema.statics.getCoursesByAdmin = function(adminId) {
  return this.find({ createdBy: adminId }).sort({ createdAt: -1 });
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
