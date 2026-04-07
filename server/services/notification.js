import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { sendMail } from './email.js';
import { callAI } from './openrouter.js';
import { getIO } from '../socket.js';
import logger from '../utils/logger.js';

/**
 * Notification Service
 * Handles triggering, AI generating, and sending notifications.
 */
class NotificationService {
    /**
     * Trigger a notification event
     * @param {string} eventType - Type of event
     * @param {string} projectId - Associated Project ID
     * @param {string} actorId - User ID who triggered the event
     * @param {Object} payload - Additional event data
     * @returns {Promise<void>}
     */
    async trigger(eventType, projectId, actorId, payload) {
        try {
            // 1. Fetch Project and members
            const project = await Project.findById(projectId).populate('members.userId');
            if (!project) return;

            const actor = await User.findById(actorId);
            const actorName = actor ? actor.name : 'Unknown User';

            // 2. Identify recipients based on eventType and project membership
            let recipients = project.members.map(m => m.userId);

            // Filter: Actor shouldn't receive notification for their own action
            recipients = recipients.filter(r => r._id.toString() !== actorId);

            // Filter: Users with email notifications disabled
            recipients = recipients.filter(r => r.notificationPrefs?.email !== false);

            // 3. AI: Generate Email Content
            const aiPrompt = `Project: ${project.name}
Event Type: ${eventType}
Triggered By: ${actorName}
Details: ${payload.bugTitle || ''} ${payload.note || ''}

Please generate a professional email subject and body (max 120 words) for this event.
Format your response as a JSON object: { "subject": "...", "body": "..." }`;

            let emailContent = {
                subject: `[BugTracker] Notification: ${eventType}`,
                body: `An event of type ${eventType} occurred in project ${project.name}.`
            };

            try {
                const aiResponse = await callAI(aiPrompt, "You are a senior engineer. Generate email content for bug notifications in JSON format.");
                if (aiResponse) {
                    const parsed = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, ''));
                    if (parsed.subject && parsed.body) {
                        emailContent = parsed;
                    }
                }
            } catch (err) {
                logger.warn(`AI content generation failed for notification: ${err.message}. Using static fallback.`);
            }

            // 4. Create Notification Record
            const notification = await Notification.create({
                projectId,
                bugId: payload.bugId,
                triggeredBy: actorId,
                eventType,
                payload,
                emailSubject: emailContent.subject,
                emailBody: emailContent.body,
                recipients: recipients.map(r => ({
                    userId: r._id,
                    email: r.email,
                    status: 'sent'
                }))
            });

            // 5. Send Emails & Socket Events
            const io = getIO();
            for (const recipient of recipients) {
                // Email
                await sendMail(recipient.email, emailContent.subject, `<p>${emailContent.body.replace(/\n/g, '<br>')}</p>`);

                // Socket: Send to individual user room
                io.to(`user:${recipient._id}`).emit('notification:new', {
                    _id: notification._id,
                    eventType,
                    actorName,
                    payload,
                    subject: emailContent.subject,
                    createdAt: notification.createdAt
                });
            }

            // Optional: Broadcast broad update to project room
            io.to(`project:${projectId}`).emit('project:activity', {
                eventType,
                actorName,
                bugId: payload.bugId
            });

            logger.info(`Notification triggered for event: ${eventType}`);
        } catch (error) {
            logger.error(`Error triggering notification: ${error.message}`);
        }
    }
}

const notificationService = new NotificationService();
export default notificationService;
