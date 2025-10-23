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