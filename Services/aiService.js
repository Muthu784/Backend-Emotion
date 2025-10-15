import { pipeline, Pipeline } from '@xenova/transformers';

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
            
            // Load emotion classification model
            this.emotionClassifier = await pipeline(
                'text-classification',
                'j-hartmann/emotion-english-distilroberta-base'
            );
            console.log('Emotion model loaded');

            // Load sentence embedding model for recommendations
            this.embedder = await pipeline(
                'feature-extraction',
                'sentence-transformers/all-MiniLM-L6-v2'
            );
            console.log('Embedding model loaded');

            // Note: DialoGPT is quite large, we'll use a simpler approach for chat
            console.log('AI models loaded successfully');
        } catch (error) {
            console.error('Error loading AI models:', error);
            throw error;
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

    async getPersonalizedRecommendations(userEmotion, userPreferences = {}) {
        if (!this.embedder) {
            await this.initializeModels();
        }

        // Enhanced recommendation database with embeddings
        const recommendations = {
            anger: [
                {
                    id: 1,
                    type: 'activity',
                    title: 'Deep Breathing Exercise',
                    description: '5-minute guided breathing to calm your nervous system',
                    emotion: 'anger',
                    url: 'https://www.verywellmind.com/deep-breathing-exercises-to-reduce-anxiety-3144706',
                    tags: ['calming', 'immediate', 'free']
                },
                {
                    id: 2,
                    type: 'music',
                    title: 'Calming Instrumental Playlist',
                    description: 'Soothing classical and ambient music',
                    emotion: 'anger',
                    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
                    tags: ['relaxing', 'focus', 'instrumental']
                },
                {
                    id: 3,
                    type: 'exercise',
                    title: 'Progressive Muscle Relaxation',
                    description: 'Release physical tension through systematic relaxation',
                    emotion: 'anger',
                    url: 'https://www.healthline.com/health/progressive-muscle-relaxation',
                    tags: ['physical', 'tension-release', 'guided']
                }
            ],
            sadness: [
                {
                    id: 4,
                    type: 'movie',
                    title: 'The Pursuit of Happyness',
                    description: 'Inspiring true story about overcoming adversity',
                    emotion: 'sadness',
                    url: 'https://www.imdb.com/title/tt0454921/',
                    tags: ['inspiring', 'hope', 'true-story']
                },
                {
                    id: 5,
                    type: 'book',
                    title: 'The Comfort Book',
                    description: 'Reflections offering comfort and reassurance',
                    emotion: 'sadness',
                    url: 'https://www.goodreads.com/book/show/55815207-the-comfort-book',
                    tags: ['comforting', 'reflective', 'easy-read']
                },
                {
                    id: 6,
                    type: 'activity',
                    title: 'Gratitude Journaling',
                    description: 'Write down three things you appreciate today',
                    emotion: 'sadness',
                    url: null,
                    tags: ['positive', 'reflective', 'personal']
                }
            ],
            joy: [
                {
                    id: 7,
                    type: 'music',
                    title: 'Upbeat Happy Playlist',
                    description: 'Energetic songs to amplify your good mood',
                    emotion: 'joy',
                    url: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC',
                    tags: ['energetic', 'dance', 'celebratory']
                },
                {
                    id: 8,
                    type: 'activity',
                    title: 'Creative Expression',
                    description: 'Channel your positive energy into art or writing',
                    emotion: 'joy',
                    url: null,
                    tags: ['creative', 'expressive', 'fun']
                }
            ],
            fear: [
                {
                    id: 9,
                    type: 'exercise',
                    title: 'Grounding Technique: 5-4-3-2-1',
                    description: 'Use your senses to stay present and reduce anxiety',
                    emotion: 'fear',
                    url: 'https://www.healthline.com/health/grounding-techniques',
                    tags: ['immediate', 'sensory', 'calming']
                },
                {
                    id: 10,
                    type: 'book',
                    title: 'Feel the Fear and Do It Anyway',
                    description: 'Classic book on overcoming fear and taking action',
                    emotion: 'fear',
                    url: 'https://www.goodreads.com/book/show/62518.Feel_the_Fear_and_Do_It_Anyway',
                    tags: ['empowering', 'practical', 'classic']
                }
            ]
        };

        // Get recommendations for the specific emotion
        let emotionRecs = recommendations[userEmotion] || [];
        
        // If no specific recommendations, provide general wellness tips
        if (emotionRecs.length === 0) {
            emotionRecs = [
                {
                    id: 11,
                    type: 'activity',
                    title: 'Mindful Breathing',
                    description: 'Take a moment to focus on your breath and be present',
                    emotion: 'general',
                    url: null,
                    tags: ['mindfulness', 'immediate', 'free']
                },
                {
                    id: 12,
                    type: 'resource',
                    title: 'Mental Health Hotline',
                    description: 'Talk to someone who can provide immediate support',
                    emotion: 'general',
                    url: 'https://www.mentalhealth.gov/get-help/immediate-help',
                    tags: ['support', 'immediate', 'professional']
                }
            ];
        }

        // Shuffle and return 3 recommendations
        return emotionRecs
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
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