import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import 'dotenv/config';

import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import cldRouter from './routes/cloudinary.route.js';
import taskRouter from './routes/task.route.js';

import { errorHandler } from './libs/middleware.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Make sure the client URL is correctly set in .env
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow all necessary methods
    credentials: true, // Enable credentials for cookie-based authentication
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow all necessary headers
  })
);

app.options('*', cors());  // Handle preflight requests

app.use((req, res, next) => {
  console.log("Request Headers:", req.headers);
  console.log("Response Headers:", res.getHeaders());
  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/image', cldRouter);
app.use('/api/v1/tasks', taskRouter);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to ProdActiveDay API' });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'not found' });
});

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});