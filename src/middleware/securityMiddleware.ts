import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Express, Request, Response, NextFunction } from 'express';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom middleware to sanitize request body and query
const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (!obj) return obj;
    if (typeof obj !== 'object') return obj;

    return Object.keys(obj).reduce(
      (acc: any, key) => {
        // Remove keys containing $ or . to prevent NoSQL injection
        if (key.includes('$') || key.includes('.')) {
          return acc;
        }

        if (typeof obj[key] === 'object' && obj[key] !== null) {
          acc[key] = sanitize(obj[key]);
        } else {
          // Convert strings containing $ to safe versions
          if (typeof obj[key] === 'string') {
            acc[key] = obj[key].replace(/\$/g, '');
          } else {
            acc[key] = obj[key];
          }
        }

        return acc;
      },
      Array.isArray(obj) ? [] : {}
    );
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query) {
    // Create a new sanitized query object instead of modifying the original
    const sanitizedQuery = sanitize(req.query);
    Object.keys(sanitizedQuery).forEach(key => {
      (req.query as any)[key] = sanitizedQuery[key];
    });
  }

  next();
};

export const configureSecurityMiddleware = (app: Express) => {
  // Set security HTTP headers
  app.use(helmet());

  // Rate limiting
  app.use('/api', limiter);

  // Custom sanitization middleware
  app.use(sanitizeRequest);
};
