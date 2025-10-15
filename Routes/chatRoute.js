import express from 'express';
import { getChatMessages, sendMessage } from '../Controllers/chatController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.get('/messages', protect, getChatMessages);
router.post('/send', protect, sendMessage);

export default router;
