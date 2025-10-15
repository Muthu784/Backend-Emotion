import express from 'express';
import { registerUser, LoginUser, getCurrentUser, updateProfile } from '../Controllers/authController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', LoginUser);
router.get('/me', protect, getCurrentUser);
router.put('/update', protect, updateProfile);

export default router;