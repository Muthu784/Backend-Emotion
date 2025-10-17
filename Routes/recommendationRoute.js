import express from 'express';
import {
    getRecommendations
} from '../Controllers/recommendationController.js';

const router = express.Router();


// Routes that match frontend expectations
router.get('/getRecommendations', getRecommendations); // GET /api/getRecommendations

// Original routes (keep for backward compatibility)
router.get('/recommendations', getRecommendations);

export default router;