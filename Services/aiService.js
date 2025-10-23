import { pipeline } from '@xenova/transformers';

class AIService {
    constructor() {
        this.emotionClassifier = null;
        this.chatGenerator = null;
        this.embedder = null;
        this.isInitializing = false;
    }

    async initializeModels() {
        if (this.isInitializing) return;
        this.isInitializing = true;

        try {
            console.log('Loading AI models...');
            
            try {
                // Try to load emotion classification model with error handling
                this.emotionClassifier = await pipeline(
                    'text-classification',
                    'j-hartmann/emotion-english-distilroberta-base',
                    { quantized: false } // Try without quantized model
                );
                console.log('Emotion model loaded');
            } catch (error) {
                console.warn('Could not load emotion model, using fallback responses');
                this.emotionClassifier = null;
            }

            try {
                // Try to load sentence embedding model with error handling
                this.embedder = await pipeline(
                    'feature-extraction',
                    'sentence-transformers/all-MiniLM-L6-v2',
                    { quantized: false } // Try without quantized model
                );
                console.log('Embedding model loaded');
            } catch (error) {
                console.warn('Could not load embedding model, using fallback recommendations');
                this.embedder = null;
            }

            if (!this.emotionClassifier && !this.embedder) {
                console.warn('Running in fallback mode - some features may be limited');
            } else {
                console.log('AI models loaded successfully');
            }
        } catch (error) {
            console.error('Error during model initialization:', error);
            // Don't throw, continue with limited functionality
        } finally {
            this.isInitializing = false;
        }
    }

    async detectEmotion(text) {
        if (!this.emotionClassifier) {
            await this.initializeModels();
        }

        try {
            const result = await this.emotionClassifier(text, {
                topk: 3 // Get top 3 emotions
            });

            // Format the response
            const emotions = result.map(emotion => ({
                label: emotion.label.toLowerCase(),
                score: emotion.score,
                percentage: Math.round(emotion.score * 100)
            }));

            return {
                primary: emotions[0],
                secondary: emotions.slice(1),
                all: emotions
            };
        } catch (error) {
            console.error('Error in emotion detection:', error);
            throw new Error('Failed to analyze emotions');
        }
    }

    async generateEmpatheticResponse(userMessage, userEmotion) {
        // Simple rule-based empathetic responses
        // In production, you could use DialoGPT or another conversational model
        const responses = {
            anger: [
                "I can sense you're feeling frustrated. It's okay to feel this way. Would you like to talk about what's bothering you?",
                "I hear the anger in your words. Sometimes expressing these feelings can help release them.",
                "It sounds like you're really upset. I'm here to listen without judgment."
            ],
            sadness: [
                "I'm sorry you're feeling down. Remember that it's okay to feel sad sometimes.",
                "Your feelings are valid. Would sharing more help lighten the burden?",
                "I'm here with you in this moment of sadness. You're not alone."
            ],
            fear: [
                "It sounds like you're feeling anxious. Let's breathe through this together.",
                "Fear can be overwhelming. What's one small step that might help you feel safer?",
                "I understand this feels scary. Remember that this moment will pass."
            ],
            joy: [
                "It's wonderful to hear your happiness! What's making you feel so good?",
                "Your joy is contagious! Celebrate these positive moments.",
                "I'm so glad you're feeling happy! Savor this feeling."
            ],
            neutral: [
                "Thanks for sharing. How has your day been so far?",
                "I'm here to listen. What's on your mind?",
                "Tell me more about what you're experiencing right now."
            ],
            surprise: [
                "That sounds unexpected! How are you feeling about this surprise?",
                "Life can be full of surprises. Would you like to explore this further?",
                "That's quite surprising! What are your thoughts about this?"
            ]
        };

        const emotionResponses = responses[userEmotion] || responses.neutral;
        const randomResponse = emotionResponses[Math.floor(Math.random() * emotionResponses.length)];

        return {
            response: randomResponse,
            suggested_emotion: userEmotion,
            timestamp: new Date().toISOString()
        };
    }

    async getPersonalizedRecommendations(emotion) {
        if (!this.embedder) {
            await this.initializeModels();
        }

        try {
            // In a real implementation, you would use the embedding model to find similar content
            // For now, we'll return some static recommendations based on emotion
            const recommendations = {
                anger: [
                    { 
                        id: 'anger-1',
                        type: 'activity', 
                        title: 'Deep Breathing Exercise', 
                        description: '5-minute guided breathing to calm your mind',
                        duration: '5 min',
                        category: 'mindfulness'
                    },
                    { 
                        id: 'anger-2',
                        type: 'article', 
                        title: 'Managing Anger', 
                        description: 'Healthy ways to process and express anger',
                        readTime: '4 min',
                        category: 'emotional health'
                    },
                    { 
                        id: 'anger-3',
                        type: 'quote', 
                        content: 'For every minute you remain angry, you give up sixty seconds of peace of mind.', 
                        author: 'Ralph Waldo Emerson',
                        category: 'inspiration'
                    }
                ],
                sadness: [
                    { 
                        id: 'sadness-1',
                        type: 'activity', 
                        title: 'Gratitude Journal', 
                        description: 'Write down three things you\'re grateful for today',
                        duration: '10 min',
                        category: 'mindfulness'
                    },
                    { 
                        id: 'sadness-2',
                        type: 'article', 
                        title: 'Coping with Sadness', 
                        description: 'Strategies for when you\'re feeling down',
                        readTime: '6 min',
                        category: 'emotional health'
                    },
                    { 
                        id: 'sadness-3',
                        type: 'quote', 
                        content: 'This too shall pass.',
                        author: 'Persian adage',
                        category: 'comfort'
                    }
                ],
                joy: [
                    { 
                        id: 'joy-1',
                        type: 'activity', 
                        title: 'Share Your Joy', 
                        description: 'Call a friend and share what\'s making you happy',
                        duration: '15 min',
                        category: 'connection'
                    },
                    { 
                        id: 'joy-2',
                        type: 'article', 
                        title: 'Spreading Happiness', 
                        description: 'How your joy can positively impact others',
                        readTime: '5 min',
                        category: 'emotional health'
                    },
                    { 
                        id: 'joy-3',
                        type: 'quote', 
                        content: 'The joy we give to others comes back to us.',
                        author: 'Unknown',
                        category: 'inspiration'
                    }
                ],
                fear: [
                    { 
                        id: 'fear-1',
                        type: 'activity', 
                        title: 'Grounding Exercise', 
                        description: '5-4-3-2-1 technique to reduce anxiety',
                        duration: '5 min',
                        category: 'anxiety relief'
                    },
                    { 
                        id: 'fear-2',
                        type: 'article', 
                        title: 'Facing Your Fears', 
                        description: 'A step-by-step guide to managing anxiety',
                        readTime: '8 min',
                        category: 'emotional health'
                    },
                    { 
                        id: 'fear-3',
                        type: 'quote', 
                        content: 'The only thing we have to fear is fear itself.', 
                        author: 'Franklin D. Roosevelt',
                        category: 'courage'
                    }
                ]
            };

            // Default to neutral if emotion not found
            const emotionRecs = recommendations[emotion.toLowerCase()] || [
                {
                    id: 'neutral-1',
                    type: 'activity',
                    title: 'Mindful Breathing',
                    description: 'Take a moment to focus on your breath',
                    duration: '3 min',
                    category: 'mindfulness'
                }
            ];

            // Shuffle and return 3 recommendations
            return emotionRecs
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
        } catch (error) {
            console.error('Error in personalized recommendations:', error);
            throw new Error('Failed to generate recommendations');
        }
    }

    // Utility function to calculate cosine similarity
    cosineSimilarity(a, b) {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
}

// Create singleton instance
const aiService = new AIService();
export default aiService;