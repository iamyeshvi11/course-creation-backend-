const Simulation = require('../models/Simulation');
const SimulationAttempt = require('../models/SimulationAttempt');
const EngagementAnalytics = require('../models/EngagementAnalytics');

// @desc    Create simulation
// @route   POST /api/simulations
// @access  Private/Admin
const createSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.create({
      ...req.body,
      createdBy: req.user._id
    });

    await simulation.populate('course', 'title riskLevel');

    res.status(201).json({
      success: true,
      message: 'Simulation created successfully',
      data: simulation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all simulations
// @route   GET /api/simulations
// @access  Private
const getAllSimulations = async (req, res) => {
  try {
    const { course, difficulty } = req.query;
    const query = {};
    
    if (course) query.course = course;
    if (difficulty) query.difficulty = difficulty;

    const simulations = await Simulation.find(query)
      .populate('course', 'title description riskLevel')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: simulations.length,
      data: simulations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single simulation
// @route   GET /api/simulations/:id
// @access  Private
const getSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id)
      .populate('course', 'title description riskLevel');

    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Simulation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: simulation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit simulation attempt
// @route   POST /api/simulations/:id/attempt
// @access  Private
const submitSimulationAttempt = async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);

    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Simulation not found'
      });
    }

    const { responses } = req.body;

    // Calculate score and risk score
    let correctCount = 0;
    let totalRiskScore = 0;
    const processedResponses = [];

    responses.forEach((response, index) => {
      const scenario = simulation.scenarios[index];
      if (scenario) {
        const isCorrect = response.selectedOption === scenario.correctOptionIndex;
        if (isCorrect) correctCount++;

        const selectedOptionData = scenario.options[response.selectedOption];
        const riskScore = selectedOptionData ? selectedOptionData.riskScore : 0;
        totalRiskScore += riskScore;

        processedResponses.push({
          scenarioId: scenario.scenarioId,
          selectedOption: response.selectedOption,
          isCorrect,
          timeTaken: response.timeTaken,
          riskScore
        });
      }
    });

    const score = Math.round((correctCount / simulation.scenarios.length) * 100);
    const passed = score >= simulation.passingScore;

    const attempt = await SimulationAttempt.create({
      user: req.user._id,
      simulation: simulation._id,
      responses: processedResponses,
      score,
      totalRiskScore,
      passed,
      feedback: passed 
        ? 'Congratulations! You have successfully completed the simulation.' 
        : `You need ${simulation.passingScore}% to pass. Please try again.`
    });

    // Track analytics
    await EngagementAnalytics.create({
      user: req.user._id,
      course: simulation.course,
      eventType: 'simulation_attempted',
      eventData: {
        simulationId: simulation._id,
        score,
        passed,
        totalRiskScore
      }
    });

    await attempt.populate('simulation', 'title passingScore');

    res.status(201).json({
      success: true,
      message: passed ? 'Simulation completed successfully!' : 'Simulation not passed',
      data: attempt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user simulation attempts
// @route   GET /api/simulations/my-attempts
// @access  Private
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await SimulationAttempt.find({ user: req.user._id })
      .populate('simulation', 'title difficulty passingScore')
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get simulation statistics
// @route   GET /api/simulations/:id/stats
// @access  Private/Admin
const getSimulationStats = async (req, res) => {
  try {
    const stats = await SimulationAttempt.aggregate([
      { $match: { simulation: mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$score' },
          passRate: {
            $avg: { $cond: ['$passed', 1, 0] }
          },
          avgRiskScore: { $avg: '$totalRiskScore' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalAttempts: 0,
        avgScore: 0,
        passRate: 0,
        avgRiskScore: 0
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

module.exports = {
  createSimulation,
  getAllSimulations,
  getSimulation,
  submitSimulationAttempt,
  getMyAttempts,
  getSimulationStats
};
