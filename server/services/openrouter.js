import axios from 'axios';
import 'dotenv/config';
import logger from '../utils/logger.js';

/**
 * OpenRouter Service
 * All AI calls go through this service using google/gemma-3-1b-it:free
 */
const openRouterClient = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
    'X-Title': 'BugTracker',
    'Content-Type': 'application/json'
  }
});

/**
 * Call OpenRouter with a prompt
 * @param {string} prompt - The prompt to send to the AI
 * @param {string} systemMessage - Optional system message
 * @returns {Promise<string|null>} - AI response as string, or null on failure
 */
export const callAI = async (prompt, systemMessage = "You are a helpful assistant for a software development bug tracking system.") => {
  try {
    const response = await openRouterClient.post('/chat/completions', {
      model: 'google/gemma-3-12b-it',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      max_tokens: 350,
      temperature: 0.5
    });

    return response.data?.choices[0]?.message?.content || null;
  } catch (error) {
    logger.error(`AI call failed: ${error.message}`);
    // Check if it's a rate limit or some other error
    if (error.response?.status === 429) {
      logger.warn('AI Rate limit reached. Using static fallback.');
    }
    return null; // Fallback will be handled by calling functions
  }
};
