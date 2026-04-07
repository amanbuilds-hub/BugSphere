import User from '../../models/User.js';
import Bug from '../../models/Bug.js';
import { callAI } from '../openrouter.js';
import logger from '../../utils/logger.js';

/**
 * Recommend Assignee for a Bug
 * Triggered on GET /api/bugs/:id/recommend
 * @param {string} bugId - ID of the bug for recommendation
 * @returns {Promise<Array<{developerId: string, name: string, score: number, reason: string}>>}
 */
export const recommendAssignee = async (bugId) => {
    try {
        const bug = await Bug.findById(bugId).populate('projectId');
        if (!bug) return [];

        const developers = await User.find({ role: 'developer', isActive: true })
            .select('name skills about activeIssueCount email _id');

        if (developers.length === 0) return [];

        const prompt = `Bug Title: ${bug.title}
Severity/Priority: ${bug.severity}/${bug.priority}
Tags: ${bug.tags.join(', ')}

Developers:
${developers.map(d => `- ${d.name} (Skills: ${d.skills.join(', ')}, Bio: ${d.about}, Active Bugs: ${d.activeIssueCount}) (ID: ${d._id})`).join('\n')}

Recommend the best developer for this bug based on:
1. Skill match (40%)
2. Current workload (35%)
3. Domain expertise (25%)

Return JSON format: [
  { "developerId": "...", "name": "...", "score": 0-100, "reason": "..." },
  ... (sorted desc by score)
]`;

        const response = await callAI(prompt, "You are a lead engineer assigning bugs to developers.");

        if (response) {
            try {
                const result = JSON.parse(response.replace(/```json/g, '').replace(/```/g, ''));
                return result.sort((a, b) => b.score - a.score);
            } catch (parseError) {
                logger.error(`Failed to parse AI assignee recommendation: ${parseError.message}`);
            }
        }
        return [];
    } catch (error) {
        logger.error(`Error in recommendAssignee: ${error.message}`);
        return [];
    }
};
