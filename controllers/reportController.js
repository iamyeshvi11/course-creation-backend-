const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const User = require('../models/User');

// @desc    Get overall system statistics
// @route   GET /api/reports/overview
// @access  Private/Admin
exports.getOverviewStats = async (req, res) => {
  try {
    // Total courses
    const totalCourses = await Course.countDocuments();

    // Total employees (assuming role: 'employee')
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Total assignments
    const totalAssignments = await Assignment.countDocuments();

    // Completed assignments
    const completedAssignments = await Assignment.countDocuments({ status: 'Completed' });

    // Overall completion percentage
    const completionPercentage = totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;

    // Overdue assignments
    const overdueAssignments = await Assignment.countDocuments({
      status: { $in: ['Assigned', 'In Progress'] },
      deadline: { $lt: new Date() }
    });

    // Overdue employees (unique count)
    const overdueEmployeeIds = await Assignment.distinct('employeeId', {
      status: { $in: ['Assigned', 'In Progress'] },
      deadline: { $lt: new Date() }
    });

    // In progress assignments
    const inProgressAssignments = await Assignment.countDocuments({ 
      status: 'In Progress' 
    });

    // Failed assignments
    const failedAssignments = await Assignment.countDocuments({ status: 'Failed' });

    // Average score across all completed assignments
    const avgScoreResult = await Assignment.aggregate([
      { $match: { status: 'Completed', score: { $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);
    const averageScore = avgScoreResult.length > 0 
      ? Math.round(avgScoreResult[0].avgScore) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        totalEmployees,
        totalAssignments,
        completedAssignments,
        inProgressAssignments,
        failedAssignments,
        overdueAssignments,
        overdueEmployees: overdueEmployeeIds.length,
        completionPercentage,
        averageScore
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview statistics',
      error: error.message
    });
  }
};

// @desc    Get department-wise completion statistics
// @route   GET /api/reports/department-stats
// @access  Private/Admin
exports.getDepartmentStats = async (req, res) => {
  try {
    const departmentStats = await Assignment.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employee.department',
          totalAssignments: { $sum: 1 },
          completedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          inProgressAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          failedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] }
          },
          overdueAssignments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['Assigned', 'In Progress']] },
                    { $lt: ['$deadline', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          averageScore: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'Completed'] },
                '$score',
                null
              ]
            }
          },
          employees: { $addToSet: '$employeeId' }
        }
      },
      {
        $project: {
          department: '$_id',
          totalAssignments: 1,
          completedAssignments: 1,
          inProgressAssignments: 1,
          failedAssignments: 1,
          overdueAssignments: 1,
          completionPercentage: {
            $cond: [
              { $eq: ['$totalAssignments', 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ['$completedAssignments', '$totalAssignments'] }, 100] },
                  2
                ]
              }
            ]
          },
          averageScore: { $round: ['$averageScore', 2] },
          totalEmployees: { $size: '$employees' }
        }
      },
      { $sort: { completionPercentage: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: departmentStats.length,
      data: departmentStats
    });
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department statistics',
      error: error.message
    });
  }
};

// @desc    Get risk-level compliance statistics
// @route   GET /api/reports/risk-compliance
// @access  Private/Admin
exports.getRiskComplianceStats = async (req, res) => {
  try {
    const riskStats = await Assignment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course.riskLevel',
          totalAssignments: { $sum: 1 },
          completedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          inProgressAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          failedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] }
          },
          assignedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Assigned'] }, 1, 0] }
          },
          overdueAssignments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['Assigned', 'In Progress']] },
                    { $lt: ['$deadline', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          averageScore: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'Completed'] },
                '$score',
                null
              ]
            }
          },
          totalCourses: { $addToSet: '$courseId' },
          totalEmployees: { $addToSet: '$employeeId' }
        }
      },
      {
        $project: {
          riskLevel: '$_id',
          totalAssignments: 1,
          completedAssignments: 1,
          inProgressAssignments: 1,
          failedAssignments: 1,
          assignedAssignments: 1,
          overdueAssignments: 1,
          complianceRate: {
            $cond: [
              { $eq: ['$totalAssignments', 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ['$completedAssignments', '$totalAssignments'] }, 100] },
                  2
                ]
              }
            ]
          },
          averageScore: { $round: ['$averageScore', 2] },
          totalCourses: { $size: '$totalCourses' },
          totalEmployees: { $size: '$totalEmployees' }
        }
      },
      {
        $sort: {
          riskLevel: 1 // Low, Medium, High
        }
      }
    ]);

    // Ensure all risk levels are represented
    const riskLevels = ['Low', 'Medium', 'High'];
    const completeStats = riskLevels.map(level => {
      const stat = riskStats.find(s => s.riskLevel === level);
      return stat || {
        riskLevel: level,
        totalAssignments: 0,
        completedAssignments: 0,
        inProgressAssignments: 0,
        failedAssignments: 0,
        assignedAssignments: 0,
        overdueAssignments: 0,
        complianceRate: 0,
        averageScore: 0,
        totalCourses: 0,
        totalEmployees: 0
      };
    });

    res.status(200).json({
      success: true,
      data: completeStats
    });
  } catch (error) {
    console.error('Get risk compliance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk compliance statistics',
      error: error.message
    });
  }
};

// @desc    Get overdue employees list
// @route   GET /api/reports/overdue-employees
// @access  Private/Admin
exports.getOverdueEmployees = async (req, res) => {
  try {
    const overdueAssignments = await Assignment.find({
      status: { $in: ['Assigned', 'In Progress'] },
      deadline: { $lt: new Date() }
    })
      .populate('employeeId', 'name email department')
      .populate('courseId', 'title riskLevel')
      .sort({ deadline: 1 });

    // Group by employee
    const employeeMap = new Map();

    overdueAssignments.forEach(assignment => {
      const empId = assignment.employeeId._id.toString();
      
      if (!employeeMap.has(empId)) {
        employeeMap.set(empId, {
          employeeId: assignment.employeeId._id,
          employeeName: assignment.employeeId.name,
          employeeEmail: assignment.employeeId.email,
          department: assignment.employeeId.department,
          overdueCourses: [],
          totalOverdue: 0
        });
      }

      const employee = employeeMap.get(empId);
      employee.overdueCourses.push({
        courseId: assignment.courseId._id,
        courseTitle: assignment.courseId.title,
        riskLevel: assignment.courseId.riskLevel,
        deadline: assignment.deadline,
        status: assignment.status,
        daysOverdue: Math.floor((new Date() - new Date(assignment.deadline)) / (1000 * 60 * 60 * 24))
      });
      employee.totalOverdue++;
    });

    const overdueEmployeesList = Array.from(employeeMap.values())
      .sort((a, b) => b.totalOverdue - a.totalOverdue);

    res.status(200).json({
      success: true,
      count: overdueEmployeesList.length,
      totalOverdueAssignments: overdueAssignments.length,
      data: overdueEmployeesList
    });
  } catch (error) {
    console.error('Get overdue employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue employees',
      error: error.message
    });
  }
};

// @desc    Get course-wise completion statistics
// @route   GET /api/reports/course-stats
// @access  Private/Admin
exports.getCourseStats = async (req, res) => {
  try {
    const courseStats = await Assignment.aggregate([
      {
        $group: {
          _id: '$courseId',
          totalAssignments: { $sum: 1 },
          completedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          inProgressAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          failedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] }
          },
          averageScore: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'Completed'] },
                '$score',
                null
              ]
            }
          },
          totalAttempts: { $sum: { $size: '$attempts' } }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          courseId: '$_id',
          courseTitle: '$course.title',
          riskLevel: '$course.riskLevel',
          passThreshold: '$course.passThreshold',
          totalAssignments: 1,
          completedAssignments: 1,
          inProgressAssignments: 1,
          failedAssignments: 1,
          completionRate: {
            $cond: [
              { $eq: ['$totalAssignments', 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ['$completedAssignments', '$totalAssignments'] }, 100] },
                  2
                ]
              }
            ]
          },
          averageScore: { $round: ['$averageScore', 2] },
          totalAttempts: 1
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: courseStats.length,
      data: courseStats
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course statistics',
      error: error.message
    });
  }
};

// @desc    Get employee-wise completion statistics
// @route   GET /api/reports/employee-stats
// @access  Private/Admin
exports.getEmployeeStats = async (req, res) => {
  try {
    const { department } = req.query;

    let matchStage = {};
    if (department) {
      const employees = await User.find({ department, role: 'employee' }).select('_id');
      const employeeIds = employees.map(e => e._id);
      matchStage = { employeeId: { $in: employeeIds } };
    }

    const employeeStats = await Assignment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$employeeId',
          totalAssignments: { $sum: 1 },
          completedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          inProgressAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          failedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] }
          },
          overdueAssignments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['Assigned', 'In Progress']] },
                    { $lt: ['$deadline', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          averageScore: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'Completed'] },
                '$score',
                null
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$_id',
          employeeName: '$employee.name',
          employeeEmail: '$employee.email',
          department: '$employee.department',
          totalAssignments: 1,
          completedAssignments: 1,
          inProgressAssignments: 1,
          failedAssignments: 1,
          overdueAssignments: 1,
          completionRate: {
            $cond: [
              { $eq: ['$totalAssignments', 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ['$completedAssignments', '$totalAssignments'] }, 100] },
                  2
                ]
              }
            ]
          },
          averageScore: { $round: ['$averageScore', 2] }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: employeeStats.length,
      data: employeeStats
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee statistics',
      error: error.message
    });
  }
};

// @desc    Get trending statistics (time-based)
// @route   GET /api/reports/trends
// @access  Private/Admin
exports.getTrendStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Assignments over time
    const assignmentTrend = await Assignment.aggregate([
      {
        $match: {
          assignedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$assignedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Completions over time
    const completionTrend = await Assignment.aggregate([
      {
        $match: {
          status: 'Completed',
          completionDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completionDate' }
          },
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      period: `${daysAgo} days`,
      data: {
        assignments: assignmentTrend,
        completions: completionTrend
      }
    });
  } catch (error) {
    console.error('Get trend stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trend statistics',
      error: error.message
    });
  }
};

// @desc    Export report data (CSV format)
// @route   GET /api/reports/export
// @access  Private/Admin
exports.exportReport = async (req, res) => {
  try {
    const { type = 'overview' } = req.query;

    let data;
    let headers;

    switch (type) {
      case 'department':
        data = await Assignment.aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'employeeId',
              foreignField: '_id',
              as: 'employee'
            }
          },
          { $unwind: '$employee' },
          {
            $lookup: {
              from: 'courses',
              localField: 'courseId',
              foreignField: '_id',
              as: 'course'
            }
          },
          { $unwind: '$course' },
          {
            $project: {
              department: '$employee.department',
              employeeName: '$employee.name',
              courseTitle: '$course.title',
              status: 1,
              score: 1,
              deadline: 1,
              completionDate: 1
            }
          }
        ]);
        break;

      case 'employees':
        data = await Assignment.find()
          .populate('employeeId', 'name email department')
          .populate('courseId', 'title riskLevel')
          .lean();
        break;

      default:
        data = await Assignment.find()
          .populate('employeeId', 'name email department')
          .populate('courseId', 'title riskLevel passThreshold')
          .populate('assignedBy', 'name')
          .lean();
    }

    res.status(200).json({
      success: true,
      count: data.length,
      data,
      message: 'Report data ready for export'
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
};
