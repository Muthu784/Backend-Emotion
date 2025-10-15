import express from 'express';
import { getEmotionHistory, addEmotion, removeEmotion, analyzeTextEmotion } from '../Controllers/emotionController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.get('/history', protect, getEmotionHistory);
router.post('/addEmotion', protect, addEmotion);
router.delete('/removeEmotion/:id', protect, removeEmotion);
router.get('/analyze', protect, analyzeTextEmotion);

export default router;