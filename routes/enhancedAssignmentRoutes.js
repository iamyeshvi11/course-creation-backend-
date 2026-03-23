const express = require('express');
const router = express.Router();
const {
  roleBasedAssignment,
  riskAwareAssignment,
  getAssignmentRecommendations,
  reAssignAfterRiskChange
} = require('../controllers/enhancedAssignmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// User routes
router.get('/recommendations', protect, getAssignmentRecommendations);

// Admin routes
router.post('/role-based', protect, authorize('admin'), roleBasedAssignment);
router.post('/risk-aware', protect, authorize('admin'), riskAwareAssignment);
router.post('/re-assign-risk', protect, authorize('admin'), reAssignAfterRiskChange);

module.exports = router;
