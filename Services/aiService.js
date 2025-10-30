import OpenAI from 'openai';

class AIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.emotionLabels = ['happy', 'sad', 'angry', 'fear', 'surprise', 'neutral'];
    }

    async detectEmotion(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid input: text must be a non-empty string');
        }

        try {
            // Use OpenAI to detect emotion
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `Analyze the following text and respond with a JSON object containing:
                        - emotion: The primary emotion (one of: ${this.emotionLabels.join(', ')})
                        - confidence: A confidence score between 0 and 1
                        - scores: An array of objects with all possible emotions and their scores

                        Example response:
                        {
                            "emotion": "happy",
                            "confidence": 0.95,
                            "scores": [
                                {"label": "happy", "score": 0.95},
                                {"label": "sad", "score": 0.02},
                                {"label": "angry", "score": 0.01},
                                {"label": "fear", "score": 0.01},
                                {"label": "surprise", "score": 0.01},
                                {"label": "neutral", "score": 0.0}
                            ]
                        }`
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.3,
                max_tokens: 200,
                response_format: { type: "json_object" }
            });

            // Parse the response
            const result = JSON.parse(response.choices[0].message.content);
            
            // Ensure the response has the expected format
            if (!result.emotion || !result.confidence || !result.scores) {
                throw new Error('Invalid response format from OpenAI');
            }

            return {
                primary: {
                    label: result.emotion,
                    score: result.confidence,
                    percentage: Math.round(result.confidence * 100)
                },
                all: result.scores.map(score => ({
                    label: score.label,
                    score: score.score,
                    percentage: Math.round(score.score * 100)
                }))
            };
        } catch (error) {
            console.error('Error in emotion detection with OpenAI:', error);
            return this.fallbackEmotionDetection(text);
        }
    }

    async chatWithEmotion(message) {
        try {
            // First detect the emotion
            const emotionAnalysis = await this.detectEmotion(message);
            const primaryEmotion = emotionAnalysis.primary.label;

            // Generate a response based on the detected emotion
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are an empathetic AI assistant. The user is feeling ${primaryEmotion}. 
                        Respond in a way that is appropriate for their emotional state. 
                        Keep responses concise and supportive.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 200
            });

            return {
                response: response.choices[0].message.content,
                detectedEmotion: {
                    label: primaryEmotion,
                    score: emotionAnalysis.primary.score,
                    percentage: emotionAnalysis.primary.percentage
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error in chatWithEmotion:', error);
            return {
                response: "I'm having trouble understanding. Could you rephrase that?",
                detectedEmotion: {
                    label: 'neutral',
                    score: 1,
                    percentage: 100
                },
                timestamp: new Date().toISOString()
            };
        }
    }

    // Fallback method if OpenAI fails
    fallbackEmotionDetection(text) {
        // Simple keyword-based fallback
        const textLower = text.toLowerCase();
        const emotions = this.emotionLabels.map(label => ({
            label,
            score: label === 'neutral' ? 1 : 0.1, // Default to neutral
            percentage: label === 'neutral' ? 100 : 10
        }));

        // Simple keyword matching
        const emotionKeywords = {
            happy: ['happy', 'good', 'great', 'wonderful', 'amazing', 'excited'],
            sad: ['sad', 'unhappy', 'depressed', 'miserable', 'upset'],
            angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated'],
            fear: ['scared', 'afraid', 'fear', 'terrified', 'nervous'],
            surprise: ['surprise', 'shocked', 'amazed', 'astonished']
        };

        // Check for emotion keywords
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                const emotionIndex = emotions.findIndex(e => e.label === emotion);
                if (emotionIndex !== -1) {
                    emotions[emotionIndex].score = 0.9;
                    emotions[emotionIndex].percentage = 90;
                    // Reduce neutral score
                    const neutralIndex = emotions.findIndex(e => e.label === 'neutral');
                    emotions[neutralIndex].score = 0.1;
                    emotions[neutralIndex].percentage = 10;
                    break;
                }
            }
        }

        return {
            primary: emotions.reduce((prev, current) => 
                (prev.score > current.score) ? prev : current
            ),
            all: emotions
        };
    }

    async getPersonalizedRecommendations(emotion) {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful assistant that provides recommendations based on emotions.
                        The user is feeling ${emotion}. 
                        Provide 3 personalized recommendations in JSON format:
                        {
                            "recommendations": [
                                {
                                    "type": "movie|book|music|activity|exercise|resource",
                                    "title": "Recommendation title",
                                    "description": "Brief description",
                                    "emotion": "${emotion}",
                                    "url": "Optional URL"
                                }
                            ]
                        }`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500,
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(response.choices[0].message.content);
            return result.recommendations || [];
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return this.getFallbackRecommendations(emotion);
        }
    }

    getFallbackRecommendations(emotion) {
        // Simple fallback recommendations
        const recommendations = {
            happy: [
                {
                    type: 'activity',
                    title: 'Go for a walk outside',
                    description: 'Enjoy the nice weather and fresh air',
                    emotion: 'happy'
                },
                {
                    type: 'music',
                    title: 'Upbeat playlist',
                    description: 'Listen to some happy, energetic music',
                    emotion: 'happy'
                }
            ],
            sad: [
                {
                    type: 'movie',
                    title: 'Feel-good movie',
                    description: 'Watch a heartwarming movie to lift your spirits',
                    emotion: 'sad'
                },
                {
                    type: 'activity',
                    title: 'Call a friend',
                    description: 'Reach out to someone you trust',
                    emotion: 'sad'
                }
            ],
            angry: [
                {
                    type: 'exercise',
                    title: 'Deep breathing',
                    description: 'Practice deep breathing exercises to calm down',
                    emotion: 'angry'
                },
                {
                    type: 'activity',
                    title: 'Journaling',
                    description: 'Write down your thoughts and feelings',
                    emotion: 'angry'
                }
            ]
        };

        return recommendations[emotion] || [
            {
                type: 'activity',
                title: 'Take a break',
                description: 'Step away and do something you enjoy',
                emotion: 'neutral'
            }
        ];
    }
}

export default new AIService();