const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const TrainingCategory = require('../models/TrainingCategory');
const { validationResult } = require('express-validator');
const { generateCourseContent } = require('../utils/aiContentGenerator');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { 
      title, 
      description, 
      riskLevel, 
      modules, 
      passThreshold, 
      category,
      categoryCode,
      isMandatory,
      estimatedDuration,
      tags,
      aiGenerated
    } = req.body;

    // Log course data for debugging
    console.log('Creating course with data:', {
      title,
      moduleCount: modules?.length,
      riskLevel
    });

    // Validate and clean up modules data
    const cleanedModules = modules.map((module, idx) => {
      console.log(`Processing module ${idx}:`, {
        title: module.title,
        contentBlockCount: module.contentBlocks?.length,
        quizCount: module.quiz?.length
      });

      // Clean up content blocks - ensure they're objects with required fields
      const contentBlocks = (module.contentBlocks || []).map((block, blockIdx) => {
        // If block is a string, convert to text block
        if (typeof block === 'string') {
          return {
            type: 'text',
            content: block
          };
        }
        
        // Validate required fields
        if (!block.type || !block.content) {
          console.error(`Invalid content block at module ${idx}, block ${blockIdx}:`, block);
          throw new Error(`Content block at module ${idx + 1}, block ${blockIdx + 1} is missing required fields (type or content)`);
        }

        return {
          type: block.type,
          content: block.content,
          title: block.title || undefined,
          fileUrl: block.fileUrl || undefined,
          duration: block.duration || undefined,
          thumbnailUrl: block.thumbnailUrl || undefined,
          metadata: block.metadata || undefined
        };
      });

      return {
        title: module.title,
        contentBlocks,
        quiz: module.quiz || []
      };
    });

    // If category ID provided, fetch category details
    let categoryData = {};
    if (category) {
      const categoryObj = await TrainingCategory.findById(category);
      if (categoryObj) {
        categoryData.category = category;
        categoryData.categoryCode = categoryObj.code;
        categoryData.isMandatory = categoryObj.isMandatory;
      }
    } else if (categoryCode) {
      const categoryObj = await TrainingCategory.findOne({ code: categoryCode.toUpperCase() });
      if (categoryObj) {
        categoryData.category = categoryObj._id;
        categoryData.categoryCode = categoryObj.code;
        categoryData.isMandatory = categoryObj.isMandatory;
      }
    }

    const course = await Course.create({
      title,
      description,
      riskLevel,
      createdBy: req.user.id,
      modules: cleanedModules,
      passThreshold: passThreshold || 70,
      estimatedDuration,
      tags,
      aiGenerated,
      ...categoryData,
      // Allow manual override of isMandatory
      isMandatory: isMandatory !== undefined ? isMandatory : categoryData.isMandatory
    });

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });
  } catch (error) {
    console.error('Create course error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

// @desc    Generate course structure using AI
// @route   POST /api/courses/generate
// @access  Private/Admin
exports.generateCourse = async (req, res) => {
  try {
    const { topic, categoryCode, riskLevel, duration } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Course topic is required'
      });
    }

    // Use AI content generator (supports OpenAI or templates)
    const generatedCourse = await generateCourseContent({
      topic,
      categoryCode,
      riskLevel: riskLevel || 'Medium',
      duration: duration || 60
    });

    // Convert contentBlocks to new format if needed
    if (generatedCourse.modules) {
      generatedCourse.modules = generatedCourse.modules.map(module => ({
        ...module,
        contentBlocks: Array.isArray(module.contentBlocks)
          ? module.contentBlocks.map(block => 
              typeof block === 'string'
                ? { type: 'text', content: block }
                : block
            )
          : []
      }));
    }

    res.status(200).json({
      success: true,
      data: generatedCourse,
      aiGenerated: generatedCourse.aiGenerated || false,
      message: generatedCourse.aiGenerated 
        ? 'Course structure generated with AI. Review and edit before saving.'
        : 'Course structure generated from template. Review and edit before saving.'
    });
  } catch (error) {
    console.error('Generate course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate course',
      error: error.message
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    const { riskLevel, search } = req.query;
    
    let query = {};
    
    if (riskLevel) {
      query.riskLevel = riskLevel;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, riskLevel, modules, passThreshold } = req.body;

    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (riskLevel) course.riskLevel = riskLevel;
    if (modules) course.modules = modules;
    if (passThreshold !== undefined) course.passThreshold = passThreshold;

    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if there are any assignments for this course
    const assignments = await Assignment.countDocuments({ courseId: req.params.id });
    
    if (assignments > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course. ${assignments} assignment(s) exist for this course.`
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
};

// @desc    Assign course to employee(s)
// @route   POST /api/courses/assign
// @access  Private/Admin
exports.assignCourse = async (req, res) => {
  try {
    const { courseId, employeeIds, deadline, notes } = req.body;

    if (!courseId || !employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and at least one employee ID are required'
      });
    }

    if (!deadline) {
      return res.status(400).json({
        success: false,
        message: 'Deadline is required'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const assignments = [];
    const errors = [];

    for (const employeeId of employeeIds) {
      try {
        // Check if assignment already exists
        const existingAssignment = await Assignment.findOne({ employeeId, courseId });
        
        if (existingAssignment) {
          errors.push({
            employeeId,
            message: 'Assignment already exists for this employee'
          });
          continue;
        }

        const assignment = await Assignment.create({
          employeeId,
          courseId,
          assignedBy: req.user.id,
          deadline: new Date(deadline),
          notes
        });

        await assignment.populate('employeeId', 'name email department');
        assignments.push(assignment);
      } catch (error) {
        errors.push({
          employeeId,
          message: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      data: assignments,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully assigned course to ${assignments.length} employee(s)`
    });
  } catch (error) {
    console.error('Assign course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign course',
      error: error.message
    });
  }
};

// @desc    Get employee's assigned courses
// @route   GET /api/courses/assignments/my
// @access  Private/Employee
exports.getMyAssignments = async (req, res) => {
  try {
    const { status } = req.query;

    const assignments = await Assignment.getEmployeeAssignments(req.user.id, status);

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
};

// @desc    Get all assignments (Admin)
// @route   GET /api/courses/assignments
// @access  Private/Admin
exports.getAllAssignments = async (req, res) => {
  try {
    const { status, courseId, employeeId } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (courseId) query.courseId = courseId;
    if (employeeId) query.employeeId = employeeId;

    const assignments = await Assignment.find(query)
      .populate('employeeId', 'name email department')
      .populate('courseId', 'title riskLevel passThreshold')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Get all assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
};

// @desc    Start/Update assignment progress
// @route   PUT /api/courses/assignments/:id/progress
// @access  Private/Employee
exports.updateProgress = async (req, res) => {
  try {
    const { moduleIndex } = req.body;

    let assignment = await Assignment.findById(req.params.id)
      .populate('courseId');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Verify this assignment belongs to the current user
    if (assignment.employeeId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment'
      });
    }

    if (moduleIndex !== undefined) {
      await assignment.updateProgress(moduleIndex);
    } else {
      await assignment.startAssignment();
    }

    await assignment.populate('courseId', 'title description riskLevel modules passThreshold');

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/courses/assignments/:id/submit
// @access  Private/Employee
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Verify this assignment belongs to the current user
    if (assignment.employeeId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this assignment'
      });
    }

    await assignment.submitAttempt(answers, timeTaken);
    await assignment.populate('courseId', 'title passThreshold');

    res.status(200).json({
      success: true,
      data: assignment,
      message: assignment.status === 'Completed' 
        ? 'Congratulations! You passed the course!' 
        : 'Quiz submitted. Unfortunately, you did not meet the pass threshold. You can try again.'
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

// @desc    Get assignment details
// @route   GET /api/courses/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('employeeId', 'name email department')
      .populate('courseId')
      .populate('assignedBy', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check authorization
    const isEmployee = assignment.employeeId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isEmployee && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this assignment'
      });
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment',
      error: error.message
    });
  }
};

// @desc    Get course statistics
// @route   GET /api/courses/:id/stats
// @access  Private/Admin
exports.getCourseStats = async (req, res) => {
  try {
    const stats = await Assignment.getCourseStats(req.params.id);

    const totalAssignments = await Assignment.countDocuments({ courseId: req.params.id });
    const completionRate = totalAssignments > 0
      ? ((stats.find(s => s._id === 'Completed')?.count || 0) / totalAssignments) * 100
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalAssignments,
        completionRate: Math.round(completionRate),
        statusBreakdown: stats
      }
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
