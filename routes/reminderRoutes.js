const express = require('express');
const router = express.Router();
const {
  createRemindersForAssignment,
  getPendingReminders,
  markReminderSent,
  getMyReminders,
  sendOverdueReminders
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// User routes
router.get('/my-reminders', protect, getMyReminders);

// Admin routes
router.post('/assignment/:assignmentId', protect, authorize('admin'), createRemindersForAssignment);
router.get('/pending', protect, authorize('admin'), getPendingReminders);
router.put('/:id/sent', protect, authorize('admin'), markReminderSent);
router.post('/send-overdue', protect, authorize('admin'), sendOverdueReminders);

module.exports = router;
