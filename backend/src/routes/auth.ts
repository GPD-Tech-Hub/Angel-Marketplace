import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

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

router.post('/register', async (req: Request, res: Response) => {
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

router.post('/login', async (req: Request, res: Response) => {
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

export default router;
