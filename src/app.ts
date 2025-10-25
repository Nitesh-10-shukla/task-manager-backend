import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import { configureSecurityMiddleware } from './middleware/securityMiddleware';
import { AppError } from './utils/errors/AppError';
import { logInfo } from './utils/logger';

const app = express();

// Load environment variables
import { config } from 'dotenv';
config();

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8081')
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, '')); // Remove trailing slashes

logInfo('Configured CORS allowed origins:', { allowedOrigins });

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const normalizedOrigin = origin.replace(/\/$/, ''); // Remove trailing slash from request origin
      if (allowedOrigins.includes(normalizedOrigin)) {
        logInfo('CORS request allowed:', { origin, normalizedOrigin });
        callback(null, true);
      } else {
        logInfo('CORS request denied:', { origin, normalizedOrigin, allowedOrigins });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Security middleware (after parsing, includes rate limiting and sanitization)
configureSecurityMiddleware(app);

// Health check endpoint
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Handle undefined routes
app.use((req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

export default app;
