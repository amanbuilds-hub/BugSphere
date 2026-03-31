import Bug from '../../models/Bug.js';
import { callAI } from '../openrouter.js';
import logger from '../../utils/logger.js';

/**
 * Suggest Resolution for a bug
 * Triggered on GET /api/bugs/:id/suggest
 * @param {string} bugId - ID of the bug for resolution suggestion
 * @returns {Promise<{suggestion: string, basedOn: string[]}>}
 */
export const suggestResolution = async (bugId) => {
    try {
        const bug = await Bug.findById(bugId);
        if (!bug) return { suggestion: '', basedOn: [] };

        const similarClosedBugs = await Bug.find({
            status: 'closed',
            projectId: bug.projectId,
            $text: { $search: bug.title }
        })
            .limit(5)
            .select('title description statusHistory _id');

        if (similarClosedBugs.length === 0) return { suggestion: 'No similar closed bugs found.', basedOn: [] };

        const prompt = `Current Bug: ${bug.title}
Description: ${bug.description}

Similar closed bugs and their resolutions:
${similarClosedBugs.map(b => `- "${b.title}" (ID: ${b._id})
  Resolution note: ${b.statusHistory[b.statusHistory.length - 1]?.note || 'No note available'}`).join('\n')}

Suggest a possible resolution for the current bug based on these similar bugs.
Return JSON format: { "suggestion": "...", "basedOn": ["bugId1", "bugId2"] }`;

        const response = await callAI(prompt, "You are a senior engineer providing bug resolution suggestions.");

        if (response) {
            try {
                const result = JSON.parse(response.replace(/```json/g, '').replace(/```/g, ''));
                return {
                    suggestion: result.suggestion,
                    basedOn: result.basedOn || []
                };
            } catch (parseError) {
                logger.error(`Failed to parse AI resolution suggestion: ${parseError.message}`);
            }
        }
        return { suggestion: 'AI suggestion unavailable. Please check similar bugs manually.', basedOn: [] };
    } catch (error) {
        logger.error(`Error in suggestResolution: ${error.message}`);
        return { suggestion: '', basedOn: [] };
    }
};
