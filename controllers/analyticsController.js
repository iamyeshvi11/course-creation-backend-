const EngagementAnalytics = require('../models/EngagementAnalytics');
const Assignment = require('../models/Assignment');
const mongoose = require('mongoose');

// @desc    Track engagement event
// @route   POST /api/analytics/track
// @access  Private
const trackEngagement = async (req, res) => {
  try {
    const { course, eventType, eventData, sessionId, deviceInfo } = req.body;

    const analytics = await EngagementAnalytics.create({
      user: req.user._id,
      course,
      eventType,
      eventData,
      sessionId,
      deviceInfo
    });

    res.status(201).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get quiz accuracy trends
// @route   GET /api/analytics/quiz-accuracy/:courseId
// @access  Private
const getQuizAccuracyTrends = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { period = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const trends = await EngagementAnalytics.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id),
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
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$eventData.quizScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      count: trends.length,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user engagement summary
// @route   GET /api/analytics/engagement-summary
// @access  Private
const getEngagementSummary = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const summary = await EngagementAnalytics.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          totalTimeSpent: { $sum: '$eventData.timeSpent' }
        }
      }
    ]);

    const quizStats = await EngagementAnalytics.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id),
          eventType: 'quiz_attempted',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgAccuracy: { $avg: '$eventData.quizAccuracy' },
          avgScore: { $avg: '$eventData.quizScore' },
          totalAttempts: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        eventSummary: summary,
        quizStats: quizStats[0] || { avgAccuracy: 0, avgScore: 0, totalAttempts: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get course engagement analytics (Admin)
// @route   GET /api/analytics/course/:courseId
// @access  Private/Admin
const getCourseEngagementAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { period = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const analytics = await EngagementAnalytics.aggregate([
      {
        $match: {
          course: mongoose.Types.ObjectId(courseId),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          eventType: '$_id',
          count: 1,
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      }
    ]);

    const quizAnalytics = await EngagementAnalytics.aggregate([
      {
        $match: {
          course: mongoose.Types.ObjectId(courseId),
          eventType: 'quiz_attempted',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgAccuracy: { $avg: '$eventData.quizAccuracy' },
          avgScore: { $avg: '$eventData.quizScore' },
          totalAttempts: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        engagementBreakdown: analytics,
        quizPerformance: quizAnalytics[0] || { avgAccuracy: 0, avgScore: 0, totalAttempts: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get department analytics (Admin)
// @route   GET /api/analytics/department/:department
// @access  Private/Admin
const getDepartmentAnalytics = async (req, res) => {
  try {
    const { department } = req.params;
    const { period = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get users from department
    const User = mongoose.model('User');
    const users = await User.find({ department }).select('_id');
    const userIds = users.map(u => u._id);

    const analytics = await EngagementAnalytics.aggregate([
      {
        $match: {
          user: { $in: userIds },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      department,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  trackEngagement,
  getQuizAccuracyTrends,
  getEngagementSummary,
  getCourseEngagementAnalytics,
  getDepartmentAnalytics
};
