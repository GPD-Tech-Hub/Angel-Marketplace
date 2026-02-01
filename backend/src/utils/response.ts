import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
}

export function sendError(res: Response, message: string, statusCode: number = 500): Response {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}
