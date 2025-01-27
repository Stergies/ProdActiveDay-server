import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../libs/dbConnect.js';

const collection = db.collection('users');

export const signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if email or username already exists
        const query = {
            $or: [{ email }, { username }],
        };
        const existingUser = await collection.findOne(query);
        if (existingUser) {
            return next({
                status: 422,
                message: 'Email or Username is already registered.',
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user object
        const user = {
            username,
            email,
            password: hashedPassword,
            avatar: 'https://g.codewithnathan.com/default-user.png',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Insert the user into the database
        const { insertedId } = await collection.insertOne(user);

        // Generate a JWT token
        const token = jwt.sign({ id: insertedId }, process.env.AUTH_SECRET);

        // Exclude sensitive fields from the response
        user._id = insertedId;
        const { password: pass, updatedAt, createdAt, ...rest } = user;

        // Send response
        res.cookie('taskly_token', token, { httpOnly: true, sameSite: 'None', secure: true, partitioned: true });
        console.log('Cookie set:', res.getHeader('Set-Cookie')); // Log cookie headers
        res.status(200).json(rest);
        
    } catch (error) {
        next({ status: 500, error });
    }
};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const validUser = await collection.findOne({ email });
        if (!validUser) {
            return next({ status: 404, message: 'User not found!' });
        }
        const validPassword = await bcrypt.compare(password, validUser.password);
        if (!validPassword) {
            return next({ status: 401, message: 'Wrong password!' });
        }
        const token = jwt.sign({ id: validUser._id }, process.env.AUTH_SECRET);
        const { password: pass, updatedAt, createdAt, ...rest } = validUser;
        res
            .cookie('taskly_token', token, { httpOnly: true, sameSite: 'None', secure: true, partitioned: true })
            .status(200)
            .json(rest);
    } catch (error) {
        next({ status: 500, error });
    }
};

export const signOut = async (req, res, next) => {
    try {
        res.clearCookie('taskly_token');
        res.status(200).json({ message: 'Sign out successful' });
    } catch (error) {
        next({ status: 500 });
    }
};