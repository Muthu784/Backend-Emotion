import express from 'express';
import { getRecommendations } from '../Controllers/recommendationController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.get('/getRecommendations', protect, getRecommendations);

export default router;