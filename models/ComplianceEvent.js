const mongoose = require('mongoose');

// Compliance calendar events
const complianceEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  eventType: {
    type: String,
    enum: ['course_deadline', 'audit', 'training_session', 'policy_review', 'certification_renewal', 'custom'],
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    },
    interval: Number,
    endAfter: Date
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetDepartments: [String],
  targetRiskLevels: [{
    type: String,
    enum: ['Low', 'Medium', 'High']
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['upcoming', 'in_progress', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  remindersBefore: [Number], // days before to send reminders
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for calendar queries
complianceEventSchema.index({ startDate: 1, endDate: 1 });
complianceEventSchema.index({ eventType: 1, status: 1 });
complianceEventSchema.index({ targetDepartments: 1 });

module.exports = mongoose.model('ComplianceEvent', complianceEventSchema);
