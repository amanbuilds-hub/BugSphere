import Bug from '../../models/Bug.js';
import { callAI } from '../openrouter.js';
import logger from '../../utils/logger.js';

/**
 * Classify Bug Priority and Severity
 * Triggered after POST /api/bugs
 * @param {string} bugId - ID of the bug to classify
 * @returns {Promise<void>}
 */
export const classifyBug = async (bugId) => {
    try {
        const bug = await Bug.findById(bugId);
        if (!bug) return;

        const prompt = `Classify this bug for priority and severity.
Title: ${bug.title}
Description: ${bug.description}

Severity levels: critical, high, medium, low.
Priority levels: urgent, high, normal, low.

Examples: 
- crash/data-loss = critical/urgent
- ui-glitch = low/low
- performance issue = medium/normal

Return JSON format: { "priority": "...", "severity": "...", "reasoning": "..." }`;

        const response = await callAI(prompt, "You are a senior QA engineer. Classify bugs for severity and priority.");

        if (response) {
            try {
                const result = JSON.parse(response.replace(/```json/g, '').replace(/```/g, ''));

                await Bug.findByIdAndUpdate(bugId, {
                    'aiMetadata.classifiedPriority': result.priority,
                    'aiMetadata.suggestedSeverity': result.severity,
                    'aiMetadata.processed': true
                });

                logger.info(`AI classification complete for bug ${bugId}`);
            } catch (parseError) {
                logger.error(`Failed to parse AI classification: ${parseError.message}`);
            }
        }
    } catch (error) {
        logger.error(`Error in classifyBug: ${error.message}`);
    }
};
