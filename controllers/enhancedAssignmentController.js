const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Course = require('../models/Course');
const Reminder = require('../models/Reminder');

// @desc    Role-based bulk course assignment
// @route   POST /api/assignments/role-based
// @access  Private/Admin
const roleBasedAssignment = async (req, res) => {
  try {
    const { courseId, targetRoles, targetDepartments, targetRiskLevels, deadline, includeExtraModules } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Build user query based on criteria
    const userQuery = { role: 'employee' };
    
    if (targetRiskLevels && targetRiskLevels.length > 0) {
      userQuery.riskLevel = { $in: targetRiskLevels };
    }
    
    if (targetDepartments && targetDepartments.length > 0) {
      userQuery.department = { $in: targetDepartments };
    }

    const users = await User.find(userQuery);

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users match the specified criteria'
      });
    }

    const assignments = [];
    const reminders = [];
    const deadlineDate = new Date(deadline);

    for (const user of users) {
      // Check if assignment already exists
      const existingAssignment = await Assignment.findOne({
        employeeId: user._id,
        courseId: courseId
      });

      if (!existingAssignment) {
        const assignment = {
          employeeId: user._id,
          courseId: courseId,
          assignedBy: req.user._id,
          deadline: deadlineDate,
          notes: `Auto-assigned based on role/department/risk level`
        };

        // Add extra modules for high-risk users if enabled
        if (includeExtraModules && user.riskLevel === 'High' && course.riskLevel === 'High') {
          assignment.notes += ' | Additional high-risk training modules required';
        }

        assignments.push(assignment);
      }
    }

    const createdAssignments = await Assignment.insertMany(assignments);

    // Create reminders for all assignments
    for (const assignment of createdAssignments) {
      const reminderSchedule = [
        { days: 7, type: 'first_reminder', priority: 'medium' },
        { days: 3, type: 'second_reminder', priority: 'high' },
        { days: 1, type: 'final_warning', priority: 'critical' }
      ];

      for (const schedule of reminderSchedule) {
        const reminderDate = new Date(deadlineDate);
        reminderDate.setDate(reminderDate.getDate() - schedule.days);

        if (reminderDate > new Date()) {
          reminders.push({
            user: assignment.employeeId,
            assignment: assignment._id,
            course: courseId,
            reminderType: schedule.type,
            scheduledFor: reminderDate,
            priority: schedule.priority,
            message: `Reminder: ${course.title} is due in ${schedule.days} day(s)`
          });
        }
      }
    }

    if (reminders.length > 0) {
      await Reminder.insertMany(reminders);
    }

    res.status(201).json({
      success: true,
      message: 'Courses assigned successfully',
      assignedCount: createdAssignments.length,
      skippedCount: users.length - createdAssignments.length,
      remindersCreated: reminders.length,
      data: {
        assignments: createdAssignments.length,
        targetUsers: users.length
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

// @desc    Assign course with risk-level appropriate modules
// @route   POST /api/assignments/risk-aware
// @access  Private/Admin
const riskAwareAssignment = async (req, res) => {
  try {
    const { courseId, userId, deadline } = req.body;

    const [course, user] = await Promise.all([
      Course.findById(courseId),
      User.findById(userId)
    ]);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user risk level matches course requirements
    const riskLevels = { 'Low': 1, 'Medium': 2, 'High': 3 };
    const userRiskScore = riskLevels[user.riskLevel];
    const courseRiskScore = riskLevels[course.riskLevel];

    if (userRiskScore < courseRiskScore) {
      return res.status(400).json({
        success: false,
        message: `User risk level (${user.riskLevel}) is insufficient for this course (requires ${course.riskLevel})`
      });
    }

    // Create assignment
    const assignment = await Assignment.create({
      employeeId: userId,
      courseId: courseId,
      assignedBy: req.user._id,
      deadline: new Date(deadline),
      notes: userRiskScore > courseRiskScore 
        ? `User has ${user.riskLevel} risk level - additional monitoring recommended`
        : 'Standard assignment'
    });

    await assignment.populate(['courseId', 'employeeId', 'assignedBy']);

    res.status(201).json({
      success: true,
      message: 'Assignment created with risk-level awareness',
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get assignment recommendations for user
// @route   GET /api/assignments/recommendations
// @access  Private
const getAssignmentRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Find courses matching user's risk level or lower
    const riskLevels = { 'Low': ['Low'], 'Medium': ['Low', 'Medium'], 'High': ['Low', 'Medium', 'High'] };
    const eligibleRiskLevels = riskLevels[user.riskLevel];

    const courses = await Course.find({
      riskLevel: { $in: eligibleRiskLevels }
    });

    // Get user's current assignments
    const assignments = await Assignment.find({ employeeId: user._id });
    const assignedCourseIds = assignments.map(a => a.courseId.toString());

    // Filter out already assigned courses
    const recommendations = courses.filter(course => 
      !assignedCourseIds.includes(course._id.toString())
    );

    // Prioritize by risk level match
    const prioritized = recommendations.sort((a, b) => {
      if (a.riskLevel === user.riskLevel && b.riskLevel !== user.riskLevel) return -1;
      if (a.riskLevel !== user.riskLevel && b.riskLevel === user.riskLevel) return 1;
      return 0;
    });

    res.status(200).json({
      success: true,
      count: prioritized.length,
      userRiskLevel: user.riskLevel,
      data: prioritized
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Bulk re-assign courses after risk level change
// @route   POST /api/assignments/re-assign-risk
// @access  Private/Admin
const reAssignAfterRiskChange = async (req, res) => {
  try {
    const { userId, newRiskLevel } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRiskLevel = user.riskLevel;
    user.riskLevel = newRiskLevel;
    await user.save();

    // Find courses that now match the new risk level
    const riskLevels = { 'Low': ['Low'], 'Medium': ['Low', 'Medium'], 'High': ['Low', 'Medium', 'High'] };
    const eligibleRiskLevels = riskLevels[newRiskLevel];

    const newCourses = await Course.find({
      riskLevel: { $in: eligibleRiskLevels }
    });

    // Get existing assignments
    const existingAssignments = await Assignment.find({ employeeId: userId });
    const assignedCourseIds = existingAssignments.map(a => a.courseId.toString());

    // Create assignments for new eligible courses
    const newAssignments = [];
    for (const course of newCourses) {
      if (!assignedCourseIds.includes(course._id.toString())) {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 30); // 30 days to complete

        newAssignments.push({
          employeeId: userId,
          courseId: course._id,
          assignedBy: req.user._id,
          deadline,
          notes: `Auto-assigned after risk level change from ${oldRiskLevel} to ${newRiskLevel}`
        });
      }
    }

    const created = await Assignment.insertMany(newAssignments);

    res.status(200).json({
      success: true,
      message: 'User risk level updated and courses re-assigned',
      oldRiskLevel,
      newRiskLevel,
      newAssignmentsCreated: created.length,
      data: created
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
  roleBasedAssignment,
  riskAwareAssignment,
  getAssignmentRecommendations,
  reAssignAfterRiskChange
};
