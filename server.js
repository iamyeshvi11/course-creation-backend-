const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Start automated reminder scheduler (optional - requires email configuration)
if (process.env.ENABLE_REMINDERS === 'true') {
  const { startReminderScheduler } = require('./utils/reminderScheduler');
  startReminderScheduler();
}

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded content)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Training category routes
app.use('/api/training-categories', require('./routes/trainingCategoryRoutes'));

// New feature routes
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/simulations', require('./routes/simulationRoutes'));
app.use('/api/policy-versions', require('./routes/policyVersionRoutes'));
app.use('/api/compliance-calendar', require('./routes/complianceCalendarRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/enhanced-assignments', require('./routes/enhancedAssignmentRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is running...',
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
