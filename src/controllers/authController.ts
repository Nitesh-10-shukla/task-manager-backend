import { Response, NextFunction } from 'express';
import { z } from 'zod';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';
import { Types } from 'mongoose';
import { AppError } from '../utils/errors/AppError';
import { logInfo } from '../utils/logger';
import { AuthenticatedRequest } from '../types/express.d';

interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Validation schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(50),
    role: z.enum(['User', 'Admin']).default('User'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const registerUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError('User already exists', 400);
    }

    const user = await User.create({ name, email, password, role });
    logInfo('New user registered', { userId: user._id, email });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(String((user as IUser)._id), (user as IUser).role);
    logInfo('User logged in', { userId: user._id, email });

    // Set secure cookie in production
    if (process.env.NODE_ENV === 'production') {
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }

    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new AppError('Not authenticated', 401);
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 even if user doesn't exist for security
      return res.json({
        status: 'success',
        message: 'If a user with that email exists, a password reset link will be sent.',
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    try {
      // TODO: Send email with reset URL
      // For now, we'll just return the token in development
      if (process.env.NODE_ENV === 'development') {
        res.json({
          status: 'success',
          message: 'Token sent to email!',
          devOnly: { resetUrl, resetToken },
        });
      } else {
        res.json({
          status: 'success',
          message: 'Token sent to email!',
        });
      }

      logInfo('Password reset requested', { email });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError('There was an error sending the email. Try again later!', 500);
    }
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logInfo('Password reset successful', { userId: user._id });

    res.json({
      status: 'success',
      message: 'Password reset successful',
    });
  } catch (err) {
    next(err);
  }
};
