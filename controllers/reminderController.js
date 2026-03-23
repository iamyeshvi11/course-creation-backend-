const Reminder = require('../models/Reminder');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Create reminders for an assignment
// @route   POST /api/reminders/assignment/:assignmentId
// @access  Private/Admin
const createRemindersForAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate('employeeId')
      .populate('courseId');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const deadline = new Date(assignment.deadline);
    const now = new Date();
    const reminders = [];

    // Calculate reminder schedule
    const schedules = [
      { days: 7, type: 'first_reminder', priority: 'medium' },
      { days: 3, type: 'second_reminder', priority: 'high' },
      { days: 1, type: 'final_warning', priority: 'critical' }
    ];

    for (const schedule of schedules) {
      const reminderDate = new Date(deadline);
      reminderDate.setDate(reminderDate.getDate() - schedule.days);

      if (reminderDate > now) {
        reminders.push({
          user: assignment.employeeId._id,
          assignment: assignment._id,
          course: assignment.courseId._id,
          reminderType: schedule.type,
          scheduledFor: reminderDate,
          priority: schedule.priority,
          message: `Reminder: ${assignment.courseId.title} is due in ${schedule.days} day(s). Please complete your training.`
        });
      }
    }

    const createdReminders = await Reminder.insertMany(reminders);

    res.status(201).json({
      success: true,
      message: 'Reminders created successfully',
      count: createdReminders.length,
      data: createdReminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get pending reminders (for cron job)
// @route   GET /api/reminders/pending
// @access  Private/Admin
const getPendingReminders = async (req, res) => {
  try {
    const now = new Date();
    const reminders = await Reminder.find({
      status: 'pending',
      scheduledFor: { $lte: now }
    })
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort({ priority: -1, scheduledFor: 1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark reminder as sent
// @route   PUT /api/reminders/:id/sent
// @access  Private/Admin
const markReminderSent = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      {
        status: 'sent',
        sentAt: new Date()
      },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user reminders
// @route   GET /api/reminders/my-reminders
// @access  Private
const getMyReminders = async (req, res) => {
  try {
    const { status, limit = 10 } = req.query;
    const query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const reminders = await Reminder.find(query)
      .populate('course', 'title description riskLevel')
      .populate('assignment')
      .sort({ scheduledFor: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send overdue reminders
// @route   POST /api/reminders/send-overdue
// @access  Private/Admin
const sendOverdueReminders = async (req, res) => {
  try {
    const overdueAssignments = await Assignment.find({
      status: { $in: ['Assigned', 'In Progress'] },
      deadline: { $lt: new Date() }
    })
      .populate('employeeId')
      .populate('courseId');

    const reminders = [];

    for (const assignment of overdueAssignments) {
      const existingOverdueReminder = await Reminder.findOne({
        assignment: assignment._id,
        reminderType: 'overdue',
        status: 'sent'
      });

      if (!existingOverdueReminder) {
        reminders.push({
          user: assignment.employeeId._id,
          assignment: assignment._id,
          course: assignment.courseId._id,
          reminderType: 'overdue',
          scheduledFor: new Date(),
          priority: 'critical',
          status: 'sent',
          sentAt: new Date(),
          message: `OVERDUE: ${assignment.courseId.title} was due. Please complete immediately to maintain compliance.`
        });
      }
    }

    if (reminders.length > 0) {
      await Reminder.insertMany(reminders);
    }

    res.status(200).json({
      success: true,
      message: 'Overdue reminders sent',
      count: reminders.length
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
  createRemindersForAssignment,
  getPendingReminders,
  markReminderSent,
  getMyReminders,
  sendOverdueReminders
};
