const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'College Attendance System'} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken, resetUrl) => {
  const message = `
    Hi ${user.name},
    
    You are receiving this email because you (or someone else) has requested a password reset for your college attendance account.
    
    Please click on the following link to reset your password:
    ${resetUrl}
    
    If you did not request this password reset, please ignore this email and your password will remain unchanged.
    
    This link will expire in 10 minutes.
    
    Best regards,
    College Attendance Team
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 20px; margin: 20px 0; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name},</h2>
          <p>You are receiving this email because you (or someone else) has requested a password reset for your college attendance account.</p>
          <p>Please click on the following button to reset your password:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 3px;">${resetUrl}</p>
          <p><strong>This link will expire in 10 minutes.</strong></p>
          <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>College Attendance Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - College Attendance System',
      message,
      html
    });
  } catch (error) {
    console.error('Password reset email failed:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user, tempPassword = null) => {
  const message = `
    Welcome to College Attendance System, ${user.name}!
    
    Your account has been successfully created.
    
    Account Details:
    - Email: ${user.email}
    - Student ID: ${user.studentId || 'N/A'}
    - Role: ${user.role}
    ${tempPassword ? `- Temporary Password: ${tempPassword}` : ''}
    
    ${tempPassword ? 'Please login and change your password immediately for security reasons.' : ''}
    
    You can now login to the system and start tracking your attendance.
    
    Best regards,
    College Attendance Team
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 20px; margin: 20px 0; }
        .info-box { background-color: #e7f3ff; border: 1px solid #bee5eb; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to College Attendance System!</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name},</h2>
          <p>Your account has been successfully created. Welcome to our college attendance tracking system!</p>
          
          <div class="info-box">
            <h3>Account Details:</h3>
            <ul>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>Student ID:</strong> ${user.studentId || 'N/A'}</li>
              <li><strong>Role:</strong> ${user.role}</li>
              ${tempPassword ? `<li><strong>Temporary Password:</strong> ${tempPassword}</li>` : ''}
            </ul>
          </div>
          
          ${tempPassword ? '<p><strong>Important:</strong> Please login and change your password immediately for security reasons.</p>' : ''}
          
          <p>You can now login to the system and start tracking your attendance.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>College Attendance Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to College Attendance System',
      message,
      html
    });
  } catch (error) {
    console.error('Welcome email failed:', error);
    throw error;
  }
};

// Send attendance alert email
const sendAttendanceAlert = async (user, subject, attendanceData) => {
  const { attendancePercentage, subjectName, subjectCode, totalClasses, attendedClasses } = attendanceData;
  
  const message = `
    Hi ${user.name},
    
    This is an important attendance alert for ${subjectName} (${subjectCode}).
    
    Your current attendance:
    - Total Classes: ${totalClasses}
    - Classes Attended: ${attendedClasses}
    - Attendance Percentage: ${attendancePercentage}%
    
    ${attendancePercentage < 75 ? 'WARNING: Your attendance is below the required 75%. Please attend upcoming classes to maintain the minimum requirement.' : ''}
    
    Best regards,
    College Attendance Team
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${attendancePercentage < 75 ? '#dc3545' : '#ffc107'}; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 20px; margin: 20px 0; }
        .alert { padding: 15px; margin: 15px 0; border-radius: 5px; }
        .alert-danger { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .alert-warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .stats { background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Attendance Alert</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name},</h2>
          <p>This is an important attendance alert for <strong>${subjectName} (${subjectCode})</strong>.</p>
          
          <div class="stats">
            <h3>Your Current Attendance:</h3>
            <ul>
              <li><strong>Total Classes:</strong> ${totalClasses}</li>
              <li><strong>Classes Attended:</strong> ${attendedClasses}</li>
              <li><strong>Attendance Percentage:</strong> ${attendancePercentage}%</li>
            </ul>
          </div>
          
          ${attendancePercentage < 75 ? 
            '<div class="alert alert-danger"><strong>WARNING:</strong> Your attendance is below the required 75%. Please attend upcoming classes to maintain the minimum requirement.</div>' :
            '<div class="alert alert-warning"><strong>NOTICE:</strong> Your attendance is close to the minimum requirement. Please continue attending classes regularly.</div>'
          }
        </div>
        <div class="footer">
          <p>Best regards,<br>College Attendance Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: `Attendance Alert - ${subjectName} (${attendancePercentage}%)`,
      message,
      html
    });
  } catch (error) {
    console.error('Attendance alert email failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendAttendanceAlert
};
