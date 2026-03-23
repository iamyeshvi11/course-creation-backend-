const express = require('express');
const router = express.Router();
const {
  trackEngagement,
  getQuizAccuracyTrends,
  getEngagementSummary,
  getCourseEngagementAnalytics,
  getDepartmentAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// User routes
router.post('/track', protect, trackEngagement);
router.get('/quiz-accuracy/:courseId', protect, getQuizAccuracyTrends);
router.get('/engagement-summary', protect, getEngagementSummary);

// Admin routes
router.get('/course/:courseId', protect, authorize('admin'), getCourseEngagementAnalytics);
router.get('/department/:department', protect, authorize('admin'), getDepartmentAnalytics);

module.exports = router;
