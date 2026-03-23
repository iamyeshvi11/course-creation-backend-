const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createCourse,
  generateCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  assignCourse,
  getMyAssignments,
  getAllAssignments,
  updateProgress,
  submitQuiz,
  getAssignment,
  getCourseStats
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Validation rules
const courseValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('riskLevel').isIn(['Low', 'Medium', 'High']).withMessage('Risk level must be Low, Medium, or High'),
  body('modules').isArray({ min: 1 }).withMessage('At least one module is required'),
  body('passThreshold').optional().isInt({ min: 0, max: 100 }).withMessage('Pass threshold must be between 0 and 100')
];

const assignCourseValidation = [
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('employeeIds').isArray({ min: 1 }).withMessage('At least one employee ID is required'),
  body('deadline').notEmpty().withMessage('Deadline is required').isISO8601().withMessage('Invalid deadline format')
];

// Course CRUD routes
router.post('/', protect, authorize('admin'), courseValidation, createCourse);
router.post('/generate', protect, authorize('admin'), generateCourse);
router.get('/', protect, getCourses);
router.get('/:id', protect, getCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

// Course statistics
router.get('/:id/stats', protect, authorize('admin'), getCourseStats);

// Assignment routes
router.post('/assign', protect, authorize('admin'), assignCourseValidation, assignCourse);
router.get('/assignments/my', protect, getMyAssignments);
router.get('/assignments', protect, authorize('admin'), getAllAssignments);
router.get('/assignments/:id', protect, getAssignment);
router.put('/assignments/:id/progress', protect, updateProgress);
router.post('/assignments/:id/submit', protect, submitQuiz);

module.exports = router;
