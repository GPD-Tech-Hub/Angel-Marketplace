import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { sendPasswordResetEmail } from '../lib/email';
import { z } from 'zod';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);
    const { email, password, firstName, lastName, phone } = body;

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return sendError(res, 'Email already in use', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone,
        passwordHash,
      },
    });

    // Generate tokens
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = signRefreshToken({ sub: user.id, email: user.email });

    // Create default notification settings
    await prisma.notificationSettings.create({
      data: { userId: user.id },
    });

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: { accessToken, refreshToken },
    }, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, { errors: error.issues });
    }
    console.error('Register error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);
    const { email, password } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = signRefreshToken({ sub: user.id, email: user.email });

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, { errors: error.issues });
    }
    console.error('Login error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const body = refreshTokenSchema.parse(req.body);
    const { refreshToken } = body;

    // Verify refresh token
    const { verifyRefreshToken } = await import('../utils/jwt');
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    // Generate new tokens
    const accessToken = signAccessToken({ sub: payload.sub, email: payload.email });
    const newRefreshToken = signRefreshToken({ sub: payload.sub, email: payload.email });

    // Shape: { success, data: { accessToken, refreshToken } } — mobile expects response.data.data.accessToken / .refreshToken
    return sendSuccess(res, {
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, { errors: error.issues });
    }
    console.error('Refresh token error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  return sendSuccess(res, { message: 'Logged out successfully' });
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

router.post('/forgot-password', passwordResetLimiter, async (req: Request, res: Response) => {
  try {
    const body = forgotPasswordSchema.parse(req.body);
    const { email } = body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      await sendPasswordResetEmail(user.email, token);
    }

    const message = 'If an account exists, a password reset link has been sent';
    return sendSuccess(res, { message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, { errors: error.issues });
    }
    console.error('Forgot password error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

router.post('/reset-password', passwordResetLimiter, async (req: Request, res: Response) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const { token, password } = body;

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return sendError(res, 'Invalid or expired reset link', 400);
    }

    if (resetRecord.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
      return sendError(res, 'Reset link has expired', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });

    return sendSuccess(res, { message: 'Password has been reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, { errors: error.issues });
    }
    console.error('Reset password error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

export default router;
