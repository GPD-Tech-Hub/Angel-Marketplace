import { describe, it, expect, vi } from 'vitest';
import { sendSuccess, sendError } from '../../src/utils/response';

describe('response utils', () => {
  describe('sendSuccess', () => {
    it('sends 200 with success: true and data', () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      sendSuccess(res as any, { id: '1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: '1' },
      });
    });

    it('includes message when provided', () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      sendSuccess(res as any, { ok: true }, 'Created');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { ok: true },
        message: 'Created',
      });
    });

    it('uses custom status code when provided', () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      sendSuccess(res as any, { id: '1' }, undefined, 201);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('sendError', () => {
    it('sends 500 with success: false and message', () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      sendError(res as any, 'Server error');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error',
      });
    });

    it('uses custom status code when provided', () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      sendError(res as any, 'Not found', 404);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
