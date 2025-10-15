import { createChatMessage, getChatMessagesByUserId } from '../Model/chat.js';
import aiService from '../Services/aiService.js';

export const getChatMessages = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const messages = await getChatMessagesByUserId(userId);
        
        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }

        // Analyze emotion from user message
        let emotionAnalysis = null;
        try {
            emotionAnalysis = await aiService.detectEmotion(content);
        } catch (error) {
            console.warn('Emotion analysis failed:', error.message);
        }

        const userEmotion = emotionAnalysis?.primary?.label || 'neutral';

        // Generate empathetic response
        const aiResponse = await aiService.generateEmpatheticResponse(content, userEmotion);

        // Save user message
        const userMessageData = {
            user_id: userId,
            content: content,
            emotion: userEmotion,
            is_user: true
        };

        const userMessage = await createChatMessage(userMessageData);

        // Save AI response
        const aiMessageData = {
            user_id: userId,
            content: aiResponse.response,
            emotion: aiResponse.suggested_emotion,
            is_user: false
        };

        const aiMessage = await createChatMessage(aiMessageData);

        res.status(201).json({
            success: true,
            data: {
                userMessage,
                aiMessage,
                emotionAnalysis: emotionAnalysis,
                recommendations: await aiService.getPersonalizedRecommendations(userEmotion)
            }
        });
    } catch (error) {
        next(error);
    }
};