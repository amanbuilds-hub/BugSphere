import { aiChatbot } from '../services/ai/chatbot.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/**
 * @desc    Chat with AI about a specific bug
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const chatWithAI = asyncHandler(async (req, res) => {
    const { bugId, message, history } = req.body;

    if (!bugId || !message) {
        throw new ApiError(400, 'VAL_001', 'Bug context and message are required');
    }

    const result = await aiChatbot(bugId, message, history || []);

    res.status(200).json({
        success: true,
        data: result
    });
});
