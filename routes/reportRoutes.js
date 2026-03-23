const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getDepartmentStats,
  getRiskComplianceStats,
  getOverdueEmployees,
  getCourseStats,
  getEmployeeStats,
  getTrendStats,
  exportReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All report routes require admin access
router.use(protect);
router.use(authorize('admin'));

// Overview statistics
router.get('/overview', getOverviewStats);

// Department-wise statistics
router.get('/department-stats', getDepartmentStats);

// Risk-level compliance statistics
router.get('/risk-compliance', getRiskComplianceStats);

// Overdue employees list
router.get('/overdue-employees', getOverdueEmployees);

// Course-wise statistics
router.get('/course-stats', getCourseStats);

// Employee-wise statistics
router.get('/employee-stats', getEmployeeStats);

// Trending statistics
router.get('/trends', getTrendStats);

// Export report data
router.get('/export', exportReport);

module.exports = router;
