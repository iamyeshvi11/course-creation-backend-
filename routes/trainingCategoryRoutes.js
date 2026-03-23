const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategory,
  getCategoryByCode,
  createCategory,
  updateCategory,
  deleteCategory,
  getMandatoryCategories,
  seedCategories
} = require('../controllers/trainingCategoryController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes (with auth)
router.get('/', protect, getAllCategories);
router.get('/mandatory', protect, getMandatoryCategories);
router.get('/code/:code', protect, getCategoryByCode);
router.get('/:id', protect, getCategory);

// Admin only routes
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.post('/seed', protect, authorize('admin'), seedCategories);

module.exports = router;
