import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface PasswordResetEmailData {
  to: string;
  username: string;
  resetToken: string;
  resetUrl: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize email transporter
   */
  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.port === 465, // true for 465, false for other ports
        auth: {
          user: config.email.smtp.user,
          pass: config.email.smtp.password,
        },
        // For development with services like Mailtrap or MailHog
        ...(config.isDevelopment && {
          ignoreTLS: true,
          requireTLS: false,
        }),
      });
    }
    return this.transporter!;
  }

  /**
   * Send a generic email
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      if (!config.email.smtp.host || !config.email.smtp.user) {
        logger.warn('SMTP not configured, skipping email send');
        console.log(`[EMAIL] Would send to ${options.to}: ${options.subject}`);
        return;
      }

      const transporter = this.getTransporter();

      const mailOptions = {
        from: config.email.fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`, { messageId: info.messageId });
    } catch (error) {
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    const subject = 'Password Reset Request - AegisX';

    const text = `
Hello ${data.username},

You have requested to reset your password for your AegisX account.

Please click the following link to reset your password:
${data.resetUrl}

If you did not request this password reset, please ignore this email.

This link will expire in 1 hour for security reasons.

Best regards,
AegisX Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - AegisX</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .button:hover { background: #1d4ed8; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
        .warning { background: #fef3cd; border: 1px solid #fde047; padding: 12px; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 AegisX Password Reset</h1>
        </div>
        <div class="content">
            <h2>Hello ${data.username},</h2>
            <p>You have requested to reset your password for your AegisX account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <a href="${data.resetUrl}" class="button">Reset Password</a>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                    <li>This link will expire in 1 hour</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px;">
                ${data.resetUrl}
            </p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The AegisX Team</p>
            <p><em>This is an automated message, please do not reply to this email.</em></p>
        </div>
    </div>
</body>
</html>
    `.trim();

    await this.sendEmail({
      to: data.to,
      subject,
      text,
      html,
    });
  }

  /**
   * Send welcome email for new users
   */
  static async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const subject = 'Welcome to AegisX!';

    const text = `
Hello ${username},

Welcome to AegisX! Your account has been successfully created.

You can now start using all the features available in your AegisX account.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
AegisX Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AegisX</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to AegisX!</h1>
        </div>
        <div class="content">
            <h2>Hello ${username},</h2>
            <p>Welcome to AegisX! Your account has been successfully created.</p>
            
            <p>You can now start using all the features available in your AegisX account.</p>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The AegisX Team</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    await this.sendEmail({
      to,
      subject,
      text,
      html,
    });
  }

  /**
   * Verify email configuration
   */
  static async verifyConfiguration(): Promise<boolean> {
    try {
      if (!config.email.smtp.host || !config.email.smtp.user) {
        return false;
      }

      const transporter = this.getTransporter();
      await transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email configuration verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}
