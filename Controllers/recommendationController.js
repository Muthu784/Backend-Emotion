import aiService from '../Services/aiService.js';

export const getRecommendations = async (req, res, next) => {
    try {
        const { emotion, text } = req.query;

        let targetEmotion = emotion;

        // If text is provided, analyze it to get emotion
        if (text && !emotion) {
            try {
                const emotionAnalysis = await aiService.detectEmotion(text);
                targetEmotion = emotionAnalysis.primary.label;
            } catch (error) {
                console.warn('Emotion analysis failed, using default:', error.message);
            }
        }

        if (!targetEmotion) {
            return res.status(400).json({
                success: false,
                message: 'Emotion parameter or text is required'
            });
        }

        const recommendations = await aiService.getPersonalizedRecommendations(targetEmotion);
        
        res.status(200).json({
            success: true,
            data: recommendations,
            detectedEmotion: targetEmotion,
            input: {
                emotion: emotion,
                text: text
            }
        });
    } catch (error) {
        next(error);
    }
};