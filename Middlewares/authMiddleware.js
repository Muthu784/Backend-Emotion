import jwt from 'jsonwebtoken';
import { getUserById } from '../Model/user.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if no token
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized, no token' 
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if (!decoded || !decoded.id) {
                console.log('Invalid token payload:', decoded);
                throw new Error('Invalid token payload');
            }

            // Get user from the token
            const user = await getUserById(decoded.id);
            
            if (!user) {
                console.log('User not found with ID:', decoded.id);
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            // Create user object with only necessary fields
            const userData = {
                id: user.id,
                username: user.username,
                email: user.email
            };

            // Attach user to request object
            req.user = userData;
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized, token failed' 
            });
        }
    } catch (error) {
        console.error('Protect middleware error:', error);
        next(error);
    }
};