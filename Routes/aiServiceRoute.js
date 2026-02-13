import express from "express";
import aiService from "../Services/aiService.js";

const router = express.Router();

router.post('/chat', async (req, res, next) => {
    try {
        const { message, userId } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Get response from AI service
        const aiResponse = await aiService.chatWithEmotion(message);
        
        // Format response to match frontend expectations
        const response = {
            id: `msg_${Date.now()}`,
            userId: userId || 'anonymous',
            message: aiResponse.response || aiResponse.content || '',
            content: aiResponse.response || aiResponse.content || '',
            emotion: aiResponse.detectedEmotion?.label || 'neutral',
            timestamp: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to process chat message',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


router.post('/PersonalizedRecommendations', async (req, res, next) => {
    try{
        const {message, userId} = req.body;
        if(!message) {
            return res.status(400).json({ error: "Message is required"});
        }
        const aiResponse = await aiService.getPersonalizedRecommendations(emotion);

        const response = {
            id: `msg_${Date.now()}`,
            userId: userId || 'anoymous' ,
            message: aiResponse.response || aiResponse.content || '',
            content: aiResponse.response || aiResponse.content || '',
            emotion: aiResponse.detectedEmotion?.label || 'neutral',
            timestamp: new Date().toISOString()
        };
        res.json(response);
    } catch (error) {
        console.error('Error in endpoint:', error);
        next();
    };
});

export default router;