import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./Routes/authRoute.js";
import emotionRouter from "./Routes/emotionRoute.js";
import recommendationRouter from "./Routes/recommendationRoute.js";
import chatRoute from "./Routes/chatRoute.js";
import { ensureUsersTable } from "./Model/user.js";
import { ensureEmotionsTable } from "./Model/emotion.js";
import { ensureChatMessagesTable } from "./Model/chat.js";
import ErrorHandler from "./Middlewares/ErrorHandler.js";

dotenv.config();

const app = express();

const CorsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(CorsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/emotions', emotionRouter);
app.use('/api/chat', chatRoute);
app.use('/api/recommendations', recommendationRouter);

// Add direct routes that match frontend expectations
app.use('/api', emotionRouter); // This will make /api/analyze available
app.use('/api', chatRoute); // This will make /api/messages available

app.get('/', (req,res)=>{
    res.send('EmotiChat AI Server with Hugging Face Integration');
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Centralized Error Handler
app.use(ErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async ()=>{
    console.log(`Server is running on port ${PORT}`);
    try{
        await ensureUsersTable();
        await ensureEmotionsTable();
        await ensureChatMessagesTable();
        console.log('All database tables are ready');
        
        // Pre-load AI models (optional - they'll load on first use)
        console.log('AI models will load on first request...');
    } catch (err) {
        console.error('Failed to ensure tables on startup:', err.message);
    }
});