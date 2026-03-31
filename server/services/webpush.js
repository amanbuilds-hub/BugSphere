import webpush from 'web-push';
import 'dotenv/config';
import logger from '../utils/logger.js';

/**
 * Configure Web Push
 */
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        `mailto:${process.env.SMTP_USER}`,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
} else {
    logger.warn('VAPID keys not found. Web push notifications disabled.');
}

/**
 * Send a push notification
 * @param {Object} subscription - Recipient subscription object
 * @param {Object} data - Notification data
 * @returns {Promise<boolean>}
 */
export const sendPush = async (subscription, data) => {
    try {
        if (!subscription || !VAPID_PUBLIC_KEY) return false;

        const payload = JSON.stringify(data);
        await webpush.sendNotification(subscription, payload);
        logger.info(`Push notification sent successfully.`);
        return true;
    } catch (error) {
        logger.error(`Error sending push notification: ${error.message}`);
        return false;
    }
};
