import express from 'express';
import { protect } from '../Middlewares/authMiddleware.js';
import {
    getEmotionHistory,
    addEmotion,
    analyzeTextEmotion,
    removeEmotion,
} from '../Controllers/emotionController.js';

const router = express.Router();

// Apply authentication middleware to all emotion routes
router.use(protect);

// Routes that match frontend expectations
router.post('/analyze', analyzeTextEmotion); // POST /api/analyze
router.get('/history', getEmotionHistory);   // GET /api/history
router.post('/AddEmotion', addEmotion);      // POST /api/AddEmotion

// Original routes (keep for backward compatibility)
router.get('/emotions/history', getEmotionHistory);
router.post('/emotions/add', addEmotion);
router.post('/emotions/analyze', analyzeTextEmotion);
router.delete('/emotions/:id', removeEmotion);

export default router;