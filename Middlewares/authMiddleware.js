import jwt from 'jsonwebtoken';
import { getUserById } from '../Model/user.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized, no token' 
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await getUserById(decoded.id);
            
            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized, token failed' 
            });
        }
    } catch (error) {
        next(error);
    }
};