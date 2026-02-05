import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: ApiError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Consistent error shape for mobile: { success: false, message, ...optional }
  const sendErr = (statusCode: number, message: string, extra?: Record<string, unknown>) =>
    res.status(statusCode).json({ success: false, message, ...(extra || {}) });

  // Zod validation errors
  if (err instanceof ZodError) {
    return sendErr(400, 'Validation error', {
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // Custom application errors
  if (err instanceof AppError || (err as ApiError).isOperational) {
    const statusCode = (err as ApiError).statusCode || 500;
    return sendErr(statusCode, err.message || 'An error occurred',
      process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : undefined);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      return sendErr(409, 'A record with this value already exists');
    }
    if (prismaError.code === 'P2025') {
      return sendErr(404, 'Record not found');
    }
  }

  // Default error
  console.error('Error:', err);
  return sendErr(
    500,
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'An unexpected error occurred',
    process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : undefined
  );
}

// Async handler wrapper to catch errors in async route handlers
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
