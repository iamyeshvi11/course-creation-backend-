const mongoose = require('mongoose');

const trainingCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Category code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  isMandatory: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    enum: ['one-time', 'annual', 'semi-annual', 'quarterly', 'monthly'],
    default: 'annual'
  },
  applicableTo: [{
    type: String,
    enum: ['all_employees', 'management', 'hr', 'it', 'finance', 'sales', 'healthcare', 'specific_departments']
  }],
  regulatoryBody: {
    type: String,
    trim: true
  },
  defaultDuration: {
    type: Number, // in minutes
    default: 60
  },
  certificateValidity: {
    type: Number, // in days
    default: 365
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  contentLibrary: [{
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['module', 'template', 'resource']
    }
  }],
  icon: {
    type: String,
    default: '📚'
  },
  color: {
    type: String,
    default: '#4A90E2'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
trainingCategorySchema.index({ code: 1 });
trainingCategorySchema.index({ isMandatory: 1 });
trainingCategorySchema.index({ isActive: 1 });

// Static method to get all active mandatory categories
trainingCategorySchema.statics.getMandatoryCategories = function() {
  return this.find({ isMandatory: true, isActive: true }).sort({ name: 1 });
};

// Static method to get categories by applicability
trainingCategorySchema.statics.getCategoriesForRole = function(role) {
  return this.find({
    isActive: true,
    $or: [
      { applicableTo: 'all_employees' },
      { applicableTo: role }
    ]
  }).sort({ isMandatory: -1, name: 1 });
};

// Method to check if certificate is still valid
trainingCategorySchema.methods.isCertificateValid = function(completionDate) {
  if (!this.certificateValidity) return true;
  const expiryDate = new Date(completionDate);
  expiryDate.setDate(expiryDate.getDate() + this.certificateValidity);
  return new Date() < expiryDate;
};

module.exports = mongoose.model('TrainingCategory', trainingCategorySchema);
