import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createUser, getUserByEmail} from '../Model/user.js';

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const registerUser = async (req, res, next) => {
    try {
        
        const { user, email } = req.body || {};
        
        // Validate required fields
        if (!user || !email) {
            console.log('Missing user or email in request');
            return res.status(400).json({ success: false, message: 'Please provide user and email' });
        }

        
        const { username, password } = user;
        
        if (!username || !password) {
            console.log('Missing username or password in user object');
            return res.status(400).json({ success: false, message: 'Please provide username and password' });
        }

        // Check if user exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const userData = {
            username: username,
            email: email,
            password: hashedPassword
        };

        const createdUser = await createUser(userData);
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = createdUser;
        
        res.status(201).json({
            success: true,
            user: userWithoutPassword,
            token: generateToken(createdUser.id),
        });
    } catch (err) {
        console.error('Register error:', err);
        next(err);
    }
};

export const LoginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        
        if (!email || !password) {
            console.log('Missing email or password in login');
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const userRecord = await getUserByEmail(email);
        if (!userRecord) {
            console.log('No user found with email:', email);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userRecord.password);
        if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = userRecord;
        
        console.log('Login successful for user:', email);
        res.status(200).json({
            success: true,
            user: userWithoutPassword,
            token: generateToken(userRecord.id),
        });
    } catch (err) {
        console.error('Login error:', err);
        next(err);
    }
};

export const getCurrentUser = async (req, res, next) => {
    try {
        // The user should be attached to req by the protect middleware
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        res.status(200).json({ 
            success: true, 
            user: userWithoutPassword
        });
    } catch (err) {
        console.error('error:', err);
        next(err);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const token = localStorage.getItem('token');
        const decodedToken = jwt.decode(token);
        const userId = decodedToken.id;

        if (!userId) {
            return res.status(401).json({ message: 'User Not Found'});
        }

        const { id, username, email} = req.body;

        if (!id || !username || !email) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const user = await getUserById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username;
        user.email = email;

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        next(error);
    }
}