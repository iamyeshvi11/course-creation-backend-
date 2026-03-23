const express = require('express');
const router = express.Router();
const {
  createSimulation,
  getAllSimulations,
  getSimulation,
  submitSimulationAttempt,
  getMyAttempts,
  getSimulationStats
} = require('../controllers/simulationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes (protected)
router.get('/', protect, getAllSimulations);
router.get('/my-attempts', protect, getMyAttempts);
router.get('/:id', protect, getSimulation);
router.post('/:id/attempt', protect, submitSimulationAttempt);

// Admin routes
router.post('/', protect, authorize('admin'), createSimulation);
router.get('/:id/stats', protect, authorize('admin'), getSimulationStats);

module.exports = router;
