import api from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  ApiResponse,
} from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post(ENDPOINTS.AUTH.LOGOUT);
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response.data.data;
  },

  async verifyResetCode(email: string, code: string): Promise<{ resetToken: string }> {
    const response = await api.post<ApiResponse<{ resetToken: string }>>(
      ENDPOINTS.AUTH.VERIFY_RESET_CODE,
      { email, code }
    );
    return response.data.data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, password }
    );
    return response.data.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>(ENDPOINTS.USER.PROFILE);
    return response.data.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(
      ENDPOINTS.USER.UPDATE_PROFILE,
      data
    );
    return response.data.data;
  },
};

export default authService;
