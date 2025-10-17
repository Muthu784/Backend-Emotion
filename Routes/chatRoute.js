import express from 'express';
import {
    getChatMessages,
    sendMessage
} from '../Controllers/chatController.js';


const router = express.Router();


// Routes that match frontend expectations
router.get('/messages', getChatMessages); // GET /api/messages
router.post('/send', sendMessage); // POST /api/send

// Original routes (keep for backward compatibility)
router.get('/chat/messages', getChatMessages);
router.post('/chat/send', sendMessage);

export default router;