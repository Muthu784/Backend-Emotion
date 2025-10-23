import aiService from '../Services/aiService.js';

// Get recommendations based on a specific emotion
export const getRecommendations = async (req, res, next) => {
    try {
        const { emotion } = req.query;

        if (!emotion) {
            return res.status(400).json({
                success: false,
                message: 'Emotion parameter is required'
            });
        }

        const recommendations = await aiService.getPersonalizedRecommendations(emotion);
        
        res.json({
            success: true,
            data: recommendations,
            emotion: emotion
        });
    } catch (error) {
        next(error);
    }
};

// Get random recommendations without requiring an emotion
export const getRandomRecommendations = async (req, res, next) => {
    try {
        const recommendations = await aiService.getRandomRecommendations();
        
        res.json({
            success: true,
            data: recommendations,
            isRandom: true
        });
    } catch (error) {
        next(error);
    }
};