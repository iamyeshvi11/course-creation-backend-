const mongoose = require('mongoose');

const simulationAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  simulation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Simulation',
    required: true
  },
  responses: [{
    scenarioId: String,
    selectedOption: Number,
    isCorrect: Boolean,
    timeTaken: Number, // seconds
    riskScore: Number
  }],
  score: {
    type: Number,
    required: true
  },
  totalRiskScore: Number,
  passed: {
    type: Boolean,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  feedback: String
}, {
  timestamps: true
});

// Index for analytics
simulationAttemptSchema.index({ user: 1, simulation: 1 });
simulationAttemptSchema.index({ completedAt: -1 });

module.exports = mongoose.model('SimulationAttempt', simulationAttemptSchema);
