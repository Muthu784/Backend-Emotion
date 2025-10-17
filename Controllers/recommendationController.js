import aiService from '../Services/aiService.js';

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
        
        res.json(recommendations);
    } catch (error) {
        next(error);
    }
};