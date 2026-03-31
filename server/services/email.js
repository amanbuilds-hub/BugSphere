import nodemailer from 'nodemailer';
import 'dotenv/config';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<boolean>}
 */
export const sendMail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"BugTracker" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        logger.info(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error(`Error sending email: ${error.message}`);
        return false;
    }
};

/**
 * Bulk send emails
 * @param {Array<{email: string, subject: string, body: string}>} emails 
 */
export const sendBulkMail = async (emails) => {
    const results = [];
    for (const item of emails) {
        const success = await sendMail(item.email, item.subject, item.body);
        results.push({ email: item.email, success });
    }
    return results;
};
