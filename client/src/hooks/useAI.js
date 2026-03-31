import { useState } from 'react';
import { chatWithAI } from '../api/ai.api';
import { getRecommendations, getResolutionSuggestion } from '../api/bugs.api';

/**
 * Hook for AI features management
 */
export const useAI = (bugId = null) => {
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async (message) => {
        setLoading(true);
        try {
            const response = await chatWithAI({ bugId, message, history: chatHistory });
            const { reply, suggestedActions } = response.data;

            setChatHistory(prev => [
                ...prev,
                { role: 'user', content: message },
                { role: 'assistant', content: reply }
            ]);

            return { reply, suggestedActions };
        } catch (err) {
            console.error('Chat AI failed:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await getRecommendations(bugId);
            return response.data;
        } catch (err) {
            console.error('AI Recommendations failed:', err);
            return [];
        }
    };

    const fetchResolutionSuggestion = async () => {
        try {
            const response = await getResolutionSuggestion(bugId);
            return response.data;
        } catch (err) {
            console.error('AI Resolution Suggestion failed:', err);
            return null;
        }
    };

    return { chatHistory, setChatHistory, loading, sendMessage, fetchRecommendations, fetchResolutionSuggestion };
};
