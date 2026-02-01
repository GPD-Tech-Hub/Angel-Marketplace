import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';

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
      return res.status(409).json({ message: 'Email already in use' });
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

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
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
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = signRefreshToken({ sub: user.id, email: user.email });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
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
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Generate new tokens
    const accessToken = signAccessToken({ sub: payload.sub, email: payload.email });
    const newRefreshToken = signRefreshToken({ sub: payload.sub, email: payload.email });

    return res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Refresh token error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  // In a stateless JWT system, logout is handled client-side by removing tokens
  // For enhanced security, you could implement a token blacklist here
  return res.json({ message: 'Logged out successfully' });
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

router.post('/forgot-password', passwordResetLimiter, async (req: Request, res: Response) => {
  try {
    const body = forgotPasswordSchema.parse(req.body);
    const { email } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists, a password reset link has been sent' });
    }

    // In production, generate reset token and send email
    // For now, just return success
    // TODO: Implement email service with reset token
    return res.json({ message: 'If an account exists, a password reset link has been sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
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

    // In production, verify reset token from database or JWT
    // For now, return error as token verification is not implemented
    // TODO: Implement token verification and password reset
    return res.status(501).json({ message: 'Password reset not yet implemented' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
