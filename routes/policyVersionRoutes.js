const express = require('express');
const router = express.Router();
const {
  createPolicyVersion,
  getPolicyVersionsByCourse,
  getLatestPolicyVersion,
  comparePolicyVersions,
  archivePolicyVersion
} = require('../controllers/policyVersionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes (protected)
router.get('/course/:courseId', protect, getPolicyVersionsByCourse);
router.get('/course/:courseId/latest', protect, getLatestPolicyVersion);

// Admin routes
router.post('/', protect, authorize('admin'), createPolicyVersion);
router.get('/compare/:id1/:id2', protect, authorize('admin'), comparePolicyVersions);
router.put('/:id/archive', protect, authorize('admin'), archivePolicyVersion);

module.exports = router;
