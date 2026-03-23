const nodemailer = require('nodemailer');
const emailTemplates = require('./emailTemplates');

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.warn('Email service not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in .env file.');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });
  }
  
  return transporter;
}

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter();
  
  if (!transport) {
    console.log('[Email Service] Email not configured, skipping send to:', to);
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Training Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const info = await transport.sendMail(mailOptions);
    
    console.log('[Email Service] Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send training assignment notification
 */
async function sendAssignmentNotification(user, course, assignment) {
  const html = emailTemplates.assignmentNotification({
    userName: user.name,
    courseTitle: course.title,
    courseDescription: course.description,
    deadline: assignment.deadline,
    loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  });

  return sendEmail({
    to: user.email,
    subject: `New Training Assignment: ${course.title}`,
    html
  });
}

/**
 * Send training reminder
 */
async function sendTrainingReminder(user, course, assignment, reminderType) {
  const daysRemaining = Math.ceil((new Date(assignment.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  
  const html = emailTemplates.trainingReminder({
    userName: user.name,
    courseTitle: course.title,
    deadline: assignment.deadline,
    daysRemaining,
    reminderType,
    loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  });

  let subject = '';
  switch(reminderType) {
    case 'first_reminder':
      subject = `Reminder: Complete ${course.title} training`;
      break;
    case 'second_reminder':
      subject = `Urgent: ${course.title} training due soon`;
      break;
    case 'final_warning':
      subject = `⚠️ Final Notice: ${course.title} training deadline tomorrow`;
      break;
    case 'overdue':
      subject = `🔴 OVERDUE: ${course.title} training past deadline`;
      break;
    default:
      subject = `Training Reminder: ${course.title}`;
  }

  return sendEmail({
    to: user.email,
    subject,
    html
  });
}

/**
 * Send completion notification
 */
async function sendCompletionNotification(user, course, score, passed) {
  const html = emailTemplates.completionNotification({
    userName: user.name,
    courseTitle: course.title,
    score,
    passed,
    passThreshold: course.passThreshold,
    certificateUrl: passed ? `${process.env.FRONTEND_URL}/certificates` : null
  });

  return sendEmail({
    to: user.email,
    subject: passed 
      ? `🎉 Congratulations! You passed ${course.title}` 
      : `Training Complete: ${course.title}`,
    html
  });
}

/**
 * Send certificate issued notification
 */
async function sendCertificateNotification(user, course, certificate) {
  const html = emailTemplates.certificateNotification({
    userName: user.name,
    courseTitle: course.title,
    certificateNumber: certificate.certificateNumber,
    issuedDate: certificate.issuedDate,
    score: certificate.score,
    grade: certificate.grade,
    downloadUrl: `${process.env.FRONTEND_URL}/certificates/${certificate._id}`
  });

  return sendEmail({
    to: user.email,
    subject: `Certificate Issued: ${course.title}`,
    html
  });
}

/**
 * Send overdue notification to admin
 */
async function sendOverdueAdminNotification(admin, overdueAssignments) {
  const html = emailTemplates.overdueAdminNotification({
    adminName: admin.name,
    count: overdueAssignments.length,
    assignments: overdueAssignments,
    dashboardUrl: `${process.env.FRONTEND_URL}/admin/reports`
  });

  return sendEmail({
    to: admin.email,
    subject: `⚠️ ${overdueAssignments.length} Overdue Training Assignments`,
    html
  });
}

/**
 * Send bulk notification to multiple users
 */
async function sendBulkEmails(users, emailFunction) {
  const results = [];
  
  for (const user of users) {
    try {
      const result = await emailFunction(user);
      results.push({ email: user.email, success: result.success });
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.push({ email: user.email, success: false, error: error.message });
    }
  }
  
  return results;
}

/**
 * Test email configuration
 */
async function testEmailConfig() {
  const transport = getTransporter();
  
  if (!transport) {
    return { success: false, message: 'Email service not configured' };
  }

  try {
    await transport.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = {
  sendEmail,
  sendAssignmentNotification,
  sendTrainingReminder,
  sendCompletionNotification,
  sendCertificateNotification,
  sendOverdueAdminNotification,
  sendBulkEmails,
  testEmailConfig
};
