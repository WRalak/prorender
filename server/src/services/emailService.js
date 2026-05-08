const nodemailer = require('nodemailer');
const { logger } = require('../middleware/errorHandler');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">Welcome to PropRent!</h2>
          <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
          <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
          <p style="margin-top: 20px;">Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p style="margin-top: 20px; color: #666;">This link will expire in 24 hours.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          <p style="margin-top: 20px;">Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p style="margin-top: 20px; color: #666;">This link will expire in 1 hour.</p>
          <p style="margin-top: 20px; color: #666;">If you didn't request this password reset, please ignore this email.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw error;
  }
};

const sendApplicationNotification = async (email, propertyTitle, type) => {
  try {
    let subject, message;
    
    if (type === 'received') {
      subject = 'New Application Received';
      message = `You have received a new rental application for ${propertyTitle}.`;
    } else if (type === 'approved') {
      subject = 'Application Approved';
      message = `Congratulations! Your application for ${propertyTitle} has been approved.`;
    } else if (type === 'rejected') {
      subject = 'Application Rejected';
      message = `Your application for ${propertyTitle} has been rejected.`;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">${subject}</h2>
          <p>${message}</p>
          <p style="margin-top: 20px;">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Dashboard</a>
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    logger.info(`Application notification sent to ${email}`);
  } catch (error) {
    logger.error('Error sending application notification:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendApplicationNotification
};