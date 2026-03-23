const ComplianceEvent = require('../models/ComplianceEvent');
const User = require('../models/User');

// @desc    Create compliance event
// @route   POST /api/compliance-calendar
// @access  Private/Admin
const createComplianceEvent = async (req, res) => {
  try {
    const event = await ComplianceEvent.create({
      ...req.body,
      createdBy: req.user._id
    });

    await event.populate('course', 'title');

    res.status(201).json({
      success: true,
      message: 'Compliance event created',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get compliance events
// @route   GET /api/compliance-calendar
// @access  Private
const getComplianceEvents = async (req, res) => {
  try {
    const { startDate, endDate, eventType, department, status } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (eventType) query.eventType = eventType;
    if (status) query.status = status;

    // Filter by user's department if not admin
    if (req.user.role !== 'admin' && department) {
      query.targetDepartments = req.user.department;
    } else if (department) {
      query.targetDepartments = department;
    }

    const events = await ComplianceEvent.find(query)
      .populate('course', 'title riskLevel')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my calendar events
// @route   GET /api/compliance-calendar/my-events
// @access  Private
const getMyCalendarEvents = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {
      $or: [
        { targetUsers: req.user._id },
        { targetDepartments: req.user.department },
        { targetRiskLevels: req.user.riskLevel }
      ]
    };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.startDate = { $gte: startDate, $lte: endDate };
    }

    const events = await ComplianceEvent.find(query)
      .populate('course', 'title')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update event status
// @route   PUT /api/compliance-calendar/:id/status
// @access  Private/Admin
const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await ComplianceEvent.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get upcoming events
// @route   GET /api/compliance-calendar/upcoming
// @access  Private
const getUpcomingEvents = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const events = await ComplianceEvent.find({
      startDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['upcoming', 'in_progress'] },
      $or: [
        { targetUsers: req.user._id },
        { targetDepartments: req.user.department },
        { targetRiskLevels: req.user.riskLevel }
      ]
    })
      .populate('course', 'title riskLevel')
      .sort({ startDate: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
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
  createComplianceEvent,
  getComplianceEvents,
  getMyCalendarEvents,
  updateEventStatus,
  getUpcomingEvents
};
