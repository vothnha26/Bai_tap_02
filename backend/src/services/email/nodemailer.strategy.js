const nodemailer = require('nodemailer');
const EmailStrategy = require('./email.strategy');
const logger = require('../../utils/logger');

class NodemailerStrategy extends EmailStrategy {
  constructor() {
    super();
    // Cấu hình linh hoạt: ưu tiên biến môi trường, mặc định dùng ethereal để dev
    const port = parseInt(process.env.EMAIL_PORT) || 465;
    const isSecure = port === 465; 
    
    const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const pass = process.env.EMAIL_PASS || process.env.GMAIL_PASS;

    // Check if using placeholder or missing credentials
    const isPlaceholder = (user === 'your_email@gmail.com' || pass === 'your_app_password_16_chars');
    const isMissing = !user || !pass;

    // Use console email if in dev and missing/placeholder, OR if explicitly requested
    this.useConsoleEmail = (process.env.NODE_ENV !== 'production' && (isMissing || isPlaceholder));

    logger.info(`[Email Config] Using User: ${user}`);
    logger.info(`[Email Config] Port: ${port}, Secure: ${isSecure}`);
    logger.info(`[Email Config] Mode: ${this.useConsoleEmail ? 'CONSOLE' : 'SMTP'}`);

    this.emailUser = user;

    if (this.useConsoleEmail) {
      logger.warn('⚠️ Email credentials are not configured or using placeholders. OTP emails will be printed to console.');
      return;
    }

    if (isMissing) {
      logger.error('❌ Error: Email credentials (EMAIL_USER/EMAIL_PASS) are missing.');
      this.useConsoleEmail = true;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: port,
      secure: isSecure, 
      auth: {
        user: user,
        pass: pass
      }
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('❌ SMTP Connection Error:', error.message);
      } else {
        logger.info('✅ SMTP Server is ready to take our messages');
      }
    });
  }

  async send(to, subject, text) {
    if (this.useConsoleEmail) {
      logger.info('----- DEV EMAIL -----');
      logger.info(`To: ${to}`);
      logger.info(`Subject: ${subject}`);
      logger.info(text);
      logger.info('---------------------');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"PubliCast" <${this.emailUser}>`,
        to,
        subject,
        text
      });
    } catch (error) {
      logger.error('❌ Failed to send email via SMTP:', error.message);
      throw error;
    }
  }
}

module.exports = NodemailerStrategy;
