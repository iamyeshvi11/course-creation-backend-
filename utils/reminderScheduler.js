const Reminder = require('../models/Reminder');
const Assignment = require('../models/Assignment');
const nodemailer = require('nodemailer');

// Configure email transporter (use your email service)
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email reminder
const sendEmailReminder = async (reminder) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email credentials not configured. Skipping email send.');
      return false;
    }

    const transporter = createEmailTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@womenwalnut.com',
      to: reminder.user.email,
      subject: `Training Reminder: ${reminder.course.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Training Reminder</h2>
          <p>Hello ${reminder.user.name},</p>
          <p>${reminder.message}</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Course:</strong> ${reminder.course.title}</p>
            <p><strong>Priority:</strong> ${reminder.priority.toUpperCase()}</p>
            <p><strong>Reminder Type:</strong> ${reminder.reminderType.replace('_', ' ').toUpperCase()}</p>
          </div>
          <p>Please log in to complete your training.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Go to Dashboard
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    });

    console.log(`Email sent to ${reminder.user.email} for reminder ${reminder._id}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return false;
  }
};

// Process pending reminders
const processPendingReminders = async () => {
  try {
    const now = new Date();
    
    // Find all pending reminders that are due
    const pendingReminders = await Reminder.find({
      status: 'pending',
      scheduledFor: { $lte: now }
    })
      .populate('user', 'name email')
      .populate('course', 'title')
      .populate('assignment')
      .limit(100); // Process in batches

    console.log(`Processing ${pendingReminders.length} pending reminders...`);

    for (const reminder of pendingReminders) {
      // Check if assignment is still pending
      if (reminder.assignment && reminder.assignment.status === 'Completed') {
        // Assignment completed, mark reminder as sent (no need to send)
        reminder.status = 'sent';
        reminder.sentAt = new Date();
        await reminder.save();
        console.log(`Reminder ${reminder._id} skipped - assignment completed`);
        continue;
      }

      // Send email
      const emailSent = await sendEmailReminder(reminder);

      // Update reminder status
      if (emailSent) {
        reminder.status = 'sent';
        reminder.sentAt = new Date();
      } else {
        reminder.status = 'failed';
      }
      
      await reminder.save();
    }

    console.log('Reminder processing completed');
    return {
      processed: pendingReminders.length,
      sent: pendingReminders.filter(r => r.status === 'sent').length,
      failed: pendingReminders.filter(r => r.status === 'failed').length
    };
  } catch (error) {
    console.error('Error processing reminders:', error.message);
    throw error;
  }
};

// Check for overdue assignments and create reminders
const checkOverdueAssignments = async () => {
  try {
    const overdueAssignments = await Assignment.find({
      status: { $in: ['Assigned', 'In Progress'] },
      deadline: { $lt: new Date() }
    })
      .populate('employeeId', 'name email')
      .populate('courseId', 'title');

    console.log(`Found ${overdueAssignments.length} overdue assignments`);

    const remindersToCreate = [];

    for (const assignment of overdueAssignments) {
      // Check if overdue reminder already exists
      const existingReminder = await Reminder.findOne({
        assignment: assignment._id,
        reminderType: 'overdue',
        status: 'sent',
        sentAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
        }
      });

      if (!existingReminder) {
        remindersToCreate.push({
          user: assignment.employeeId._id,
          assignment: assignment._id,
          course: assignment.courseId._id,
          reminderType: 'overdue',
          scheduledFor: new Date(),
          priority: 'critical',
          message: `OVERDUE: ${assignment.courseId.title} was due. Please complete immediately to maintain compliance.`
        });
      }
    }

    if (remindersToCreate.length > 0) {
      await Reminder.insertMany(remindersToCreate);
      console.log(`Created ${remindersToCreate.length} overdue reminders`);
    }

    return remindersToCreate.length;
  } catch (error) {
    console.error('Error checking overdue assignments:', error.message);
    throw error;
  }
};

// Schedule automatic reminder processing (call this from server.js)
const startReminderScheduler = () => {
  // Run every 15 minutes
  const INTERVAL = 15 * 60 * 1000; // 15 minutes

  console.log('📧 Reminder scheduler started');
  console.log(`⏰ Running every ${INTERVAL / 1000 / 60} minutes`);

  // Run immediately on start
  processPendingReminders().catch(console.error);
  checkOverdueAssignments().catch(console.error);

  // Then run on interval
  setInterval(async () => {
    console.log(`\n🔔 Running scheduled reminder check at ${new Date().toISOString()}`);
    
    try {
      await processPendingReminders();
      await checkOverdueAssignments();
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }, INTERVAL);
};

module.exports = {
  processPendingReminders,
  checkOverdueAssignments,
  sendEmailReminder,
  startReminderScheduler
};
