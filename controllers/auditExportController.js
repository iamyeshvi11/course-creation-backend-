const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Course = require('../models/Course');
const EngagementAnalytics = require('../models/EngagementAnalytics');
const PolicyVersion = require('../models/PolicyVersion');
const SimulationAttempt = require('../models/SimulationAttempt');

// @desc    Generate comprehensive audit report
// @route   GET /api/audit/export
// @access  Private/Admin
const generateAuditReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json', department, riskLevel } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.assignedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get all assignments
    const assignments = await Assignment.find(query)
      .populate('employeeId', 'name email department riskLevel')
      .populate('courseId', 'title riskLevel passThreshold')
      .populate('assignedBy', 'name email');

    // Filter by department or risk level if specified
    let filteredAssignments = assignments;
    if (department) {
      filteredAssignments = assignments.filter(a => a.employeeId.department === department);
    }
    if (riskLevel) {
      filteredAssignments = assignments.filter(a => a.courseId.riskLevel === riskLevel);
    }

    // Aggregate statistics
    const stats = {
      totalAssignments: filteredAssignments.length,
      completed: filteredAssignments.filter(a => a.status === 'Completed').length,
      inProgress: filteredAssignments.filter(a => a.status === 'In Progress').length,
      overdue: filteredAssignments.filter(a => a.isOverdue).length,
      avgCompletionRate: 0,
      avgScore: 0
    };

    const completedAssignments = filteredAssignments.filter(a => a.status === 'Completed');
    if (completedAssignments.length > 0) {
      stats.avgScore = completedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / completedAssignments.length;
      stats.avgCompletionRate = (completedAssignments.length / filteredAssignments.length) * 100;
    }

    // Department breakdown
    const departmentBreakdown = {};
    filteredAssignments.forEach(assignment => {
      const dept = assignment.employeeId.department;
      if (!departmentBreakdown[dept]) {
        departmentBreakdown[dept] = {
          total: 0,
          completed: 0,
          inProgress: 0,
          overdue: 0
        };
      }
      departmentBreakdown[dept].total++;
      if (assignment.status === 'Completed') departmentBreakdown[dept].completed++;
      if (assignment.status === 'In Progress') departmentBreakdown[dept].inProgress++;
      if (assignment.isOverdue) departmentBreakdown[dept].overdue++;
    });

    // Risk level breakdown
    const riskBreakdown = { Low: 0, Medium: 0, High: 0 };
    filteredAssignments.forEach(assignment => {
      if (assignment.courseId && assignment.courseId.riskLevel) {
        riskBreakdown[assignment.courseId.riskLevel]++;
      }
    });

    // Compliance data
    const complianceData = filteredAssignments.map(assignment => ({
      employeeName: assignment.employeeId.name,
      employeeEmail: assignment.employeeId.email,
      department: assignment.employeeId.department,
      employeeRiskLevel: assignment.employeeId.riskLevel,
      courseTitle: assignment.courseId.title,
      courseRiskLevel: assignment.courseId.riskLevel,
      status: assignment.status,
      assignedDate: assignment.assignedAt,
      deadline: assignment.deadline,
      completionDate: assignment.completionDate,
      score: assignment.score,
      attempts: assignment.attemptCount,
      isOverdue: assignment.isOverdue,
      daysRemaining: assignment.daysRemaining,
      assignedBy: assignment.assignedBy.name
    }));

    const auditReport = {
      generatedAt: new Date(),
      generatedBy: req.user.name,
      period: {
        start: startDate || 'All time',
        end: endDate || 'Present'
      },
      filters: {
        department: department || 'All',
        riskLevel: riskLevel || 'All'
      },
      summary: stats,
      departmentBreakdown,
      riskBreakdown,
      complianceData,
      reportMetadata: {
        totalRecords: complianceData.length,
        reportType: 'Compliance Audit',
        version: '1.0'
      }
    };

    // Return based on format
    if (format === 'csv') {
      const csvData = convertToCSV(complianceData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-report-${Date.now()}.csv`);
      return res.send(csvData);
    }

    res.status(200).json({
      success: true,
      data: auditReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export user training history
// @route   GET /api/audit/user/:userId/history
// @access  Private/Admin
const exportUserTrainingHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const assignments = await Assignment.find({ employeeId: userId })
      .populate('courseId', 'title riskLevel passThreshold')
      .sort({ assignedAt: -1 });

    const simulations = await SimulationAttempt.find({ user: userId })
      .populate('simulation', 'title difficulty')
      .sort({ completedAt: -1 });

    const policyAcknowledgments = await PolicyVersion.find({
      notifiedUsers: userId
    })
      .populate('course', 'title')
      .sort({ publishedAt: -1 });

    const report = {
      user: {
        name: user.name,
        email: user.email,
        department: user.department,
        riskLevel: user.riskLevel
      },
      trainingHistory: assignments.map(a => ({
        course: a.courseId.title,
        status: a.status,
        assignedDate: a.assignedAt,
        completionDate: a.completionDate,
        score: a.score,
        attempts: a.attemptCount
      })),
      simulationHistory: simulations.map(s => ({
        simulation: s.simulation.title,
        score: s.score,
        passed: s.passed,
        completedAt: s.completedAt
      })),
      policyAcknowledgments: policyAcknowledgments.map(p => ({
        course: p.course.title,
        version: p.version,
        publishedAt: p.publishedAt,
        requiresRetraining: p.requiresRetraining
      })),
      generatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export compliance summary by department
// @route   GET /api/audit/department/:department/summary
// @access  Private/Admin
const exportDepartmentComplianceSummary = async (req, res) => {
  try {
    const { department } = req.params;

    const users = await User.find({ department, role: 'employee' });
    const userIds = users.map(u => u._id);

    const assignments = await Assignment.find({ employeeId: { $in: userIds } })
      .populate('courseId', 'title riskLevel')
      .populate('employeeId', 'name email');

    const summary = {
      department,
      totalEmployees: users.length,
      assignments: {
        total: assignments.length,
        completed: assignments.filter(a => a.status === 'Completed').length,
        inProgress: assignments.filter(a => a.status === 'In Progress').length,
        overdue: assignments.filter(a => a.isOverdue).length
      },
      complianceRate: 0,
      avgScore: 0,
      employeeDetails: users.map(user => {
        const userAssignments = assignments.filter(a => a.employeeId._id.toString() === user._id.toString());
        const completed = userAssignments.filter(a => a.status === 'Completed');
        
        return {
          name: user.name,
          email: user.email,
          riskLevel: user.riskLevel,
          totalAssignments: userAssignments.length,
          completedAssignments: completed.length,
          overdueAssignments: userAssignments.filter(a => a.isOverdue).length,
          avgScore: completed.length > 0 
            ? completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length 
            : 0
        };
      }),
      generatedAt: new Date()
    };

    const completedAssignments = assignments.filter(a => a.status === 'Completed');
    if (completedAssignments.length > 0) {
      summary.complianceRate = (completedAssignments.length / assignments.length) * 100;
      summary.avgScore = completedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / completedAssignments.length;
    }

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to convert to CSV
function convertToCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  );

  return [headers, ...rows].join('\n');
}

module.exports = {
  generateAuditReport,
  exportUserTrainingHistory,
  exportDepartmentComplianceSummary
};
