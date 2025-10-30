import express from 'express';
import {
    getRecommendations,
    getRandomRecommendations
} from '../Controllers/recommendationController.js';

const router = express.Router();


// Recommendation endpoints
router.get('/', getRecommendations);           // GET /api/recommendations?emotion=:emotion
router.get('/random', getRandomRecommendations); // GET /api/recommendations/random

// Backward compatibility routes (deprecated)
router.get('/getRecommendations', getRecommendations);

export default router;



// import express from 'express';
// import { authenticateToken } from '../middleware/auth.js';
// import {
//   getRecommendations,
//   getRecommendationsByUserId,
//   createRecommendation,
//   updateRecommendationFeedback,
//   getAllEmotions,
//   getAllRecommendationTypes
// } from '../models/recommendations.js';

// const router = express.Router();

// // Get recommendations based on emotion and types
// router.get('/recommendations', authenticateToken, async (req, res) => {
//   try {
//     const { emotion, types } = req.query;
    
//     if (!emotion) {
//       return res.status(400).json({ error: 'Emotion parameter is required' });
//     }
    
//     // Convert types string to array if provided
//     const typeArray = types ? types.split(',') : null;
    
//     const recommendations = await getRecommendations(emotion, typeArray);
//     res.json({ data: recommendations });
//   } catch (error) {
//     console.error('Error in GET /recommendations:', error);
//     res.status(500).json({ error: 'Failed to fetch recommendations' });
//   }
// });

// // Get user-specific recommendations
// router.get('/recommendations/user', authenticateToken, async (req, res) => {
//   try {
//     const recommendations = await getRecommendationsByUserId(req.user.id);
//     res.json({ data: recommendations });
//   } catch (error) {
//     console.error('Error in GET /recommendations/user:', error);
//     res.status(500).json({ error: 'Failed to fetch user recommendations' });
//   }
// });

// // Create a new recommendation
// router.post('/recommendations', authenticateToken, async (req, res) => {
//   try {
//     const { emotion, type, title, description, url, tags } = req.body;
    
//     if (!emotion || !type || !title) {
//       return res.status(400).json({ 
//         error: 'Emotion, type, and title are required' 
//       });
//     }
    
//     const recommendation = await createRecommendation({
//       user_id: req.user.id,
//       emotion,
//       type,
//       title,
//       description,
//       url,
//       tags
//     });
    
//     res.status(201).json({ data: recommendation });
//   } catch (error) {
//     console.error('Error in POST /recommendations:', error);
//     res.status(500).json({ error: 'Failed to create recommendation' });
//   }
// });

// // Update recommendation feedback
// router.patch('/recommendations/:id/feedback', authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isHelpful } = req.body;
    
//     if (typeof isHelpful !== 'boolean') {
//       return res.status(400).json({ error: 'isHelpful must be a boolean value' });
//     }
    
//     const recommendation = await updateRecommendationFeedback(id, isHelpful);
    
//     if (!recommendation) {
//       return res.status(404).json({ error: 'Recommendation not found' });
//     }
    
//     res.json({ data: recommendation });
//   } catch (error) {
//     console.error('Error in PATCH /recommendations/:id/feedback:', error);
//     res.status(500).json({ error: 'Failed to update recommendation feedback' });
//   }
// });

// // Get all available emotions
// router.get('/emotions', async (req, res) => {
//   try {
//     const emotions = await getAllEmotions();
//     res.json({ data: emotions });
//   } catch (error) {
//     console.error('Error in GET /emotions:', error);
//     res.status(500).json({ error: 'Failed to fetch emotions' });
//   }
// });

// // Get all recommendation types
// router.get('/recommendation-types', async (req, res) => {
//   try {
//     const types = await getAllRecommendationTypes();
//     res.json({ data: types });
//   } catch (error) {
//     console.error('Error in GET /recommendation-types:', error);
//     res.status(500).json({ error: 'Failed to fetch recommendation types' });
//   }
// });

// export default router;