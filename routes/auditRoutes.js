const express = require('express');
const router = express.Router();
const {
  generateAuditReport,
  exportUserTrainingHistory,
  exportDepartmentComplianceSummary
} = require('../controllers/auditExportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All audit routes require admin access
router.use(protect);
router.use(authorize('admin'));

router.get('/export', generateAuditReport);
router.get('/user/:userId/history', exportUserTrainingHistory);
router.get('/department/:department/summary', exportDepartmentComplianceSummary);

module.exports = router;
