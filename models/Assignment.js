const mongoose = require('mongoose');

// Attempt Schema to track each quiz attempt
const attemptSchema = new mongoose.Schema({
  attemptNumber: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  answers: [{
    moduleIndex: Number,
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean
  }],
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeTaken: {
    type: Number, // in minutes
    default: 0
  }
}, { _id: true });

// Assignment Schema
const assignmentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['Assigned', 'In Progress', 'Completed', 'Failed'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Assigned'
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigner (admin) reference is required']
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  completionDate: {
    type: Date,
    default: null
  },
  attempts: [attemptSchema],
  currentModuleIndex: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: null
  },
  lastAccessedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one assignment per employee per course
assignmentSchema.index({ employeeId: 1, courseId: 1 }, { unique: true });

// Indexes for better query performance
assignmentSchema.index({ employeeId: 1, status: 1 });
assignmentSchema.index({ courseId: 1 });
assignmentSchema.index({ deadline: 1 });
assignmentSchema.index({ assignedBy: 1 });

// Virtual for checking if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Completed') return false;
  return new Date() > this.deadline;
});

// Virtual for number of attempts
assignmentSchema.virtual('attemptCount').get(function() {
  return this.attempts.length;
});

// Virtual for best score
assignmentSchema.virtual('bestScore').get(function() {
  if (this.attempts.length === 0) return null;
  return Math.max(...this.attempts.map(attempt => attempt.score));
});

// Virtual for days remaining
assignmentSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'Completed') return null;
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Instance method to start assignment
assignmentSchema.methods.startAssignment = function() {
  if (this.status === 'Assigned') {
    this.status = 'In Progress';
    this.startedAt = new Date();
  }
  this.lastAccessedAt = new Date();
  return this.save();
};

// Instance method to update progress
assignmentSchema.methods.updateProgress = function(moduleIndex) {
  this.currentModuleIndex = moduleIndex;
  this.lastAccessedAt = new Date();
  if (this.status === 'Assigned') {
    this.status = 'In Progress';
    this.startedAt = new Date();
  }
  return this.save();
};

// Instance method to submit attempt
assignmentSchema.methods.submitAttempt = async function(answers, timeTaken) {
  // Fetch the course to check correct answers
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.courseId);
  
  if (!course) {
    throw new Error('Course not found');
  }

  // Calculate score
  let correctAnswers = 0;
  let totalQuestions = 0;
  const processedAnswers = [];

  answers.forEach(answer => {
    const module = course.modules[answer.moduleIndex];
    if (module && module.quiz && module.quiz[answer.questionIndex]) {
      totalQuestions++;
      const question = module.quiz[answer.questionIndex];
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      
      if (isCorrect) correctAnswers++;
      
      processedAnswers.push({
        moduleIndex: answer.moduleIndex,
        questionIndex: answer.questionIndex,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      });
    }
  });

  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  // Add attempt
  const attempt = {
    attemptNumber: this.attempts.length + 1,
    score,
    answers: processedAnswers,
    completedAt: new Date(),
    timeTaken: timeTaken || 0
  };
  
  this.attempts.push(attempt);
  this.lastAccessedAt = new Date();
  
  // Update status based on score and pass threshold
  if (score >= course.passThreshold) {
    this.status = 'Completed';
    this.score = score;
    this.completionDate = new Date();
  } else {
    this.status = 'Failed';
    this.score = score;
  }
  
  return this.save();
};

// Static method to get assignments by employee
assignmentSchema.statics.getEmployeeAssignments = function(employeeId, status = null) {
  const query = { employeeId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('courseId', 'title description riskLevel passThreshold')
    .populate('assignedBy', 'name email')
    .sort({ deadline: 1 });
};

// Static method to get overdue assignments
assignmentSchema.statics.getOverdueAssignments = function() {
  return this.find({
    status: { $in: ['Assigned', 'In Progress'] },
    deadline: { $lt: new Date() }
  })
    .populate('employeeId', 'name email department')
    .populate('courseId', 'title riskLevel');
};

// Static method to get course statistics
assignmentSchema.statics.getCourseStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgScore: { $avg: '$score' }
      }
    }
  ]);
  
  return stats;
};

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
