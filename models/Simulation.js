const mongoose = require('mongoose');

// Scenario-based simulation training
const simulationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  scenarios: [{
    scenarioId: String,
    title: String,
    description: String,
    situation: String,
    options: [{
      optionText: String,
      isCorrect: Boolean,
      feedback: String,
      riskScore: Number // Impact of choosing this option
    }],
    correctOptionIndex: Number,
    points: Number,
    timeLimit: Number // seconds
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  passingScore: {
    type: Number,
    default: 70
  },
  estimatedDuration: Number, // minutes
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Simulation', simulationSchema);
