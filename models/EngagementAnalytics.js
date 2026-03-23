const mongoose = require('mongoose');

// Engagement analytics tracking
const engagementAnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  eventType: {
    type: String,
    enum: [
      'course_started',
      'module_viewed',
      'quiz_attempted',
      'quiz_completed',
      'course_completed',
      'simulation_attempted',
      'time_spent',
      'page_view',
      'video_watched',
      'document_downloaded'
    ],
    required: true
  },
  eventData: {
    moduleId: String,
    quizScore: Number,
    quizAccuracy: Number,
    timeSpent: Number, // seconds
    attempts: Number,
    questionId: String,
    selectedAnswer: Number,
    isCorrect: Boolean,
    metadata: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionId: String,
  deviceInfo: {
    browser: String,
    os: String,
    device: String
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
engagementAnalyticsSchema.index({ user: 1, timestamp: -1 });
engagementAnalyticsSchema.index({ course: 1, eventType: 1 });
engagementAnalyticsSchema.index({ timestamp: -1 });
engagementAnalyticsSchema.index({ eventType: 1, timestamp: -1 });

// Static method to get quiz accuracy trends
engagementAnalyticsSchema.statics.getQuizAccuracyTrends = async function(userId, courseId, period = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        course: mongoose.Types.ObjectId(courseId),
        eventType: 'quiz_attempted',
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
        },
        avgAccuracy: { $avg: '$eventData.quizAccuracy' },
        totalAttempts: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('EngagementAnalytics', engagementAnalyticsSchema);
