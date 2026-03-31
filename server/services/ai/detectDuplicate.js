import Bug from '../../models/Bug.js';
import { callAI } from '../openrouter.js';
import logger from '../../utils/logger.js';

/**
 * Detect Duplicate Bug
 * Triggered inside POST /api/bugs before save
 * @param {string} title - New bug title
 * @param {string} description - New bug description
 * @returns {Promise<{isDuplicate: boolean, similarBugId: string, confidence: number}>}
 */
export const detectDuplicate = async (title, description) => {
    try {
        const existingBugs = await Bug.find({ status: { $ne: 'closed' } })
            .select('title _id')
            .sort({ createdAt: -1 })
            .limit(50);

        if (existingBugs.length === 0) return { isDuplicate: false, similarBugId: null, confidence: 0 };

        const prompt = `New bug title: ${title}
Description: ${description}

Existing bugs:
${existingBugs.map(b => `- "${b.title}" (ID: ${b._id})`).join('\n')}

Determine if this new bug is a duplicate of any existing ones. 
Return JSON format: { "isDuplicate": boolean, "similarBugId": "...", "confidence": 0-1, "reason": "..." }`;

        const response = await callAI(prompt, "You are a senior developer checking for bug duplicates.");

        if (response) {
            try {
                const result = JSON.parse(response.replace(/```json/g, '').replace(/```/g, ''));
                return {
                    isDuplicate: result.isDuplicate,
                    similarBugId: result.similarBugId,
                    confidence: result.confidence
                };
            } catch (parseError) {
                logger.error(`Failed to parse AI duplicate detection: ${parseError.message}`);
            }
        }
        return { isDuplicate: false, similarBugId: null, confidence: 0 };
    } catch (error) {
        logger.error(`Error in detectDuplicate: ${error.message}`);
        return { isDuplicate: false, similarBugId: null, confidence: 0 };
    }
};
