const express = require('express');
const router = express.Router();
const {
  createComplianceEvent,
  getComplianceEvents,
  getMyCalendarEvents,
  updateEventStatus,
  getUpcomingEvents
} = require('../controllers/complianceCalendarController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// User routes
router.get('/my-events', protect, getMyCalendarEvents);
router.get('/upcoming', protect, getUpcomingEvents);

// Admin routes
router.post('/', protect, authorize('admin'), createComplianceEvent);
router.get('/', protect, authorize('admin'), getComplianceEvents);
router.put('/:id/status', protect, authorize('admin'), updateEventStatus);

module.exports = router;
