import { createEmotion, getEmotionsByUserId, deleteEmotion } from '../Model/emotion.js';
import aiService from '../Services/aiService.js';

export const getEmotionHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const emotions = await getEmotionsByUserId(userId);
        
        res.status(200).json({
            success: true,
            data: emotions
        });
    } catch (error) {
        next(error);
    }
};

export const addEmotion = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { text, emotion, intensity, context } = req.body;

        let detectedEmotion = null;
        let confidence = 0;

        // If text is provided, use AI to detect emotion
        if (text) {
            try {
                const emotionAnalysis = await aiService.detectEmotion(text);
                detectedEmotion = emotionAnalysis.primary.label;
                confidence = emotionAnalysis.primary.score;
                
                console.log('AI Emotion Detection:', {
                    text,
                    detected: detectedEmotion,
                    confidence,
                    all: emotionAnalysis.all
                });
            } catch (aiError) {
                console.warn('AI emotion detection failed, using provided emotion:', aiError.message);
            }
        }

        // Use detected emotion or provided emotion
        const finalEmotion = detectedEmotion || emotion || 'neutral';
        const finalIntensity = intensity || Math.round(confidence * 10) || 5;

        const emotionData = {
            user_id: userId,
            emotion: finalEmotion,
            intensity: finalIntensity,
            context: context || text || 'Manual entry',
            confidence: confidence,
            ai_analyzed: !!text
        };

        const newEmotion = await createEmotion(emotionData);
        
        res.status(201).json({
            success: true,
            data: newEmotion,
            analysis: detectedEmotion ? {
                primary: detectedEmotion,
                confidence: confidence,
                alternatives: detectedEmotion ? await aiService.detectEmotion(text) : null
            } : null
        });
    } catch (error) {
        next(error);
    }
};

export const analyzeTextEmotion = async (req, res, next) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required for emotion analysis'
            });
        }

        const emotionAnalysis = await aiService.detectEmotion(text);
        
        res.status(200).json({
            success: true,
            data: emotionAnalysis,
            text: text
        });
    } catch (error) {
        next(error);
    }
};

export const removeEmotion = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const deleted = await deleteEmotion(id, userId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Emotion not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Emotion deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};