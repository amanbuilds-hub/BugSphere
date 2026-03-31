import Bug from '../../models/Bug.js';
import { callAI } from '../openrouter.js';
import logger from '../../utils/logger.js';

/**
 * Summarize Bug Description
 * Triggered on GET /api/bugs/:id or after creation
 * @param {string} bugId - ID of the bug for summarization
 * @returns {Promise<string>}
 */
export const summarizeBug = async (bugId) => {
    try {
        const bug = await Bug.findById(bugId);
        if (!bug) return '';

        // If already summarized, return existing
        if (bug.aiMetadata?.summary) return bug.aiMetadata.summary;

        const prompt = `Bug Title: ${bug.title}
Description: ${bug.description}
Steps To Reproduce: ${bug.stepsToReproduce}

Summarize this bug in 2-3 lines for a quick overview.
Return JSON format: { "summary": "..." }`;

        const response = await callAI(prompt, "You are a senior technical writer summarizing bug reports.");

        if (response) {
            try {
                const result = JSON.parse(response.replace(/```json/g, '').replace(/```/g, ''));
                if (result.summary) {
                    await Bug.findByIdAndUpdate(bugId, {
                        'aiMetadata.summary': result.summary
                    });
                    return result.summary;
                }
            } catch (parseError) {
                logger.error(`Failed to parse AI bug summary: ${parseError.message}`);
            }
        }
        return bug.description.substring(0, 100) + '...'; // Static fallback
    } catch (error) {
        logger.error(`Error in summarizeBug: ${error.message}`);
        return '';
    }
};
