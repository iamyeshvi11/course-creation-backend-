/**
 * Email HTML templates for various notifications
 */

const baseStyles = `
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #5568d3; }
    .alert { padding: 15px; border-radius: 5px; margin: 15px 0; }
    .alert-warning { background: #fff3cd; border-left: 4px solid #ffc107; }
    .alert-danger { background: #f8d7da; border-left: 4px solid #dc3545; }
    .alert-success { background: #d4edda; border-left: 4px solid #28a745; }
    .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
    h1 { margin: 0; font-size: 24px; }
    h2 { color: #667eea; font-size: 20px; }
    .highlight { color: #667eea; font-weight: bold; }
  </style>
`;

/**
 * Assignment notification email
 */
function assignmentNotification({ userName, courseTitle, courseDescription, deadline, loginUrl }) {
  const deadlineDate = new Date(deadline).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 New Training Assignment</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>You have been assigned a new mandatory compliance training course:</p>
          
          <div class="info-box">
            <h2>${courseTitle}</h2>
            <p>${courseDescription}</p>
          </div>
          
          <div class="alert alert-warning">
            <strong>⏰ Deadline:</strong> ${deadlineDate}
          </div>
          
          <p>Please complete this training before the deadline to maintain compliance. The training includes interactive modules and a quiz at the end.</p>
          
          <div style="text-align: center;">
            <a href="${loginUrl}/my-courses" class="button">Start Training Now</a>
          </div>
          
          <p><strong>Why this training matters:</strong></p>
          <ul>
            <li>Ensures regulatory compliance</li>
            <li>Protects you and the organization</li>
            <li>Maintains professional standards</li>
          </ul>
          
          <p>If you have any questions, please contact your supervisor or the HR department.</p>
          
          <p>Best regards,<br>Training & Compliance Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the Training Management System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Training reminder email
 */
function trainingReminder({ userName, courseTitle, deadline, daysRemaining, reminderType, loginUrl }) {
  const deadlineDate = new Date(deadline).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let urgencyClass = 'alert-warning';
  let urgencyIcon = '⏰';
  let urgencyMessage = `You have ${daysRemaining} days remaining`;

  if (reminderType === 'final_warning') {
    urgencyClass = 'alert-danger';
    urgencyIcon = '⚠️';
    urgencyMessage = 'FINAL NOTICE: Deadline is tomorrow!';
  } else if (reminderType === 'overdue') {
    urgencyClass = 'alert-danger';
    urgencyIcon = '🔴';
    urgencyMessage = 'OVERDUE: This training is past its deadline!';
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${urgencyIcon} Training Reminder</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <div class="alert ${urgencyClass}">
            <strong>${urgencyMessage}</strong>
          </div>
          
          <p>This is a reminder to complete your mandatory training:</p>
          
          <div class="info-box">
            <h2>${courseTitle}</h2>
            <p><strong>Deadline:</strong> ${deadlineDate}</p>
            ${daysRemaining > 0 ? `<p><strong>Days Remaining:</strong> ${daysRemaining}</p>` : ''}
          </div>
          
          ${reminderType === 'overdue' ? `
            <div class="alert alert-danger">
              <strong>⚠️ Action Required:</strong> This training is now overdue. Please complete it immediately to avoid compliance issues.
            </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${loginUrl}/my-courses" class="button">Complete Training Now</a>
          </div>
          
          <p>Completing this training on time is essential for maintaining organizational compliance and your professional development.</p>
          
          <p>If you're experiencing any difficulties accessing or completing the training, please contact your supervisor immediately.</p>
          
          <p>Best regards,<br>Training & Compliance Team</p>
        </div>
        <div class="footer">
          <p>This is an automated reminder from the Training Management System.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Completion notification email
 */
function completionNotification({ userName, courseTitle, score, passed, passThreshold, certificateUrl }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${passed ? '🎉 Congratulations!' : '📋 Training Complete'}</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          ${passed ? `
            <div class="alert alert-success">
              <strong>✅ You passed!</strong> You have successfully completed the training course.
            </div>
          ` : `
            <div class="alert alert-warning">
              <strong>Training Submitted</strong> - You did not meet the passing threshold this time.
            </div>
          `}
          
          <div class="info-box">
            <h2>${courseTitle}</h2>
            <p><strong>Your Score:</strong> <span class="highlight">${score}%</span></p>
            <p><strong>Passing Threshold:</strong> ${passThreshold}%</p>
            <p><strong>Status:</strong> ${passed ? 'PASSED ✓' : 'Not Passed'}</p>
          </div>
          
          ${passed ? `
            <p>Excellent work! Your certificate has been generated and is available for download.</p>
            ${certificateUrl ? `
              <div style="text-align: center;">
                <a href="${certificateUrl}" class="button">Download Certificate</a>
              </div>
            ` : ''}
          ` : `
            <p>You can retake the quiz to improve your score. Please review the course materials and try again.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/my-courses" class="button">Retake Quiz</a>
            </div>
          `}
          
          <p>Thank you for completing this important compliance training.</p>
          
          <p>Best regards,<br>Training & Compliance Team</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from the Training Management System.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Certificate issued notification
 */
function certificateNotification({ userName, courseTitle, certificateNumber, issuedDate, score, grade, downloadUrl }) {
  const formattedDate = new Date(issuedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Certificate Issued</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <div class="alert alert-success">
            <strong>✅ Certificate Generated</strong>
          </div>
          
          <p>Your certificate of completion has been issued for:</p>
          
          <div class="info-box">
            <h2>${courseTitle}</h2>
            <p><strong>Certificate Number:</strong> <span class="highlight">${certificateNumber}</span></p>
            <p><strong>Issue Date:</strong> ${formattedDate}</p>
            <p><strong>Score:</strong> ${score}%</p>
            <p><strong>Grade:</strong> ${grade}</p>
          </div>
          
          <p>This certificate validates your successful completion of the compliance training and can be used for professional records.</p>
          
          <div style="text-align: center;">
            <a href="${downloadUrl}" class="button">Download Certificate</a>
          </div>
          
          <p><strong>Important:</strong> Please keep this certificate for your records. You may need it for future reference or compliance audits.</p>
          
          <p>Congratulations on your achievement!</p>
          
          <p>Best regards,<br>Training & Compliance Team</p>
        </div>
        <div class="footer">
          <p>Certificate Number: ${certificateNumber}</p>
          <p>This is an automated notification from the Training Management System.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Overdue admin notification
 */
function overdueAdminNotification({ adminName, count, assignments, dashboardUrl }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Overdue Training Report</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${adminName}</strong>,</p>
          
          <div class="alert alert-danger">
            <strong>⚠️ ${count} overdue training assignment${count > 1 ? 's' : ''}</strong>
          </div>
          
          <p>The following employees have overdue compliance training that requires immediate attention:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Employee</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Course</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Days Overdue</th>
              </tr>
            </thead>
            <tbody>
              ${assignments.slice(0, 10).map(assignment => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${assignment.employeeName}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${assignment.courseTitle}</td>
                  <td style="padding: 10px; border: 1px solid #ddd; color: #dc3545;">${assignment.daysOverdue} days</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${count > 10 ? `<p><em>... and ${count - 10} more overdue assignments</em></p>` : ''}
          
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">View Full Report</a>
          </div>
          
          <p><strong>Recommended Actions:</strong></p>
          <ul>
            <li>Contact employees with overdue training</li>
            <li>Escalate to department heads if necessary</li>
            <li>Review and address any systemic issues</li>
            <li>Update compliance records</li>
          </ul>
          
          <p>Best regards,<br>Training Management System</p>
        </div>
        <div class="footer">
          <p>This is an automated report from the Training Management System.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  assignmentNotification,
  trainingReminder,
  completionNotification,
  certificateNotification,
  overdueAdminNotification
};
