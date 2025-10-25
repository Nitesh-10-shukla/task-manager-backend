import { Request } from 'express';

// Extending Request type to include body, params, and user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
  body: any; // This will allow any type for request body
  params: {
    [key: string]: string;
  };
  protocol: string;
  get: (name: string) => string | undefined;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
      body: any;
      params: {
        [key: string]: string;
      };
      protocol: string;
      get: (name: string) => string | undefined;
    }
  }
}

export {};
