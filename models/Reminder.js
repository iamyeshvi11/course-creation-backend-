const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  reminderType: {
    type: String,
    enum: ['initial', 'first_reminder', 'second_reminder', 'final_warning', 'overdue'],
    required: true
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  sentAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient queries
reminderSchema.index({ user: 1, status: 1 });
reminderSchema.index({ scheduledFor: 1, status: 1 });
reminderSchema.index({ assignment: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
