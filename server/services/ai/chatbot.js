import Bug from '../../models/Bug.js';
import Project from '../../models/Project.js';
import { callAI } from '../openrouter.js';
import logger from '../../utils/logger.js';

/**
 * AI Chatbot Assistant for Bugs
 * Triggered on POST /api/ai/chat
 * @param {string} bugId - Contextual bug ID
 * @param {string} userMessage - User's query
 * @param {Array<{role: string, content: string}>} history - Last 10 messages
 * @returns {Promise<{reply: string, suggestedActions: string[]}>}
 */
export const aiChatbot = async (bugId, userMessage, history = []) => {
    try {
        const bug = await Bug.findById(bugId).populate('projectId');
        if (!bug) return { reply: 'Bug not found.', suggestedActions: [] };

        const project = await Project.findById(bug.projectId);
        const projectName = project ? project.name : 'Unknown Project';

        const systemMessage = `You are a senior engineer for project "${projectName}". 
Context: Bug "${bug.title}" (ID: ${bug._id}). 
Description: ${bug.description}
Current Status: ${bug.status}
Tags: ${bug.tags.join(', ')}

Answer bug-related questions only. Be concise and professional.
Limit history to last 10 messages if provided.
Return JSON format: { "reply": "...", "suggestedActions": ["Assign to me", "Close", "Add tag 'help-wanted'"] }`;

        const fullPrompt = `History: ${JSON.stringify(history)}
User: ${userMessage}`;

        const response = await callAI(fullPrompt, systemMessage);

        if (response) {
            try {
                const result = JSON.parse(response.replace(/```json/g, '').replace(/```/g, ''));
                return {
                    reply: result.reply,
                    suggestedActions: result.suggestedActions || []
                };
            } catch (parseError) {
                logger.error(`Failed to parse AI chatbot response: ${parseError.message}`);
            }
        }
        return { reply: 'AI helper is unavailable. Please try again later.', suggestedActions: [] };
    } catch (error) {
        logger.error(`Error in aiChatbot: ${error.message}`);
        return { reply: 'Internal server error occurred.', suggestedActions: [] };
    }
};
