import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store';
import { authService } from '@/services';
import { LoginCredentials, RegisterData } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login: storeLogin, 
    logout: storeLogout,
    setLoading 
  } = useAuthStore();

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const { user, tokens } = await authService.login(credentials);
      await storeLogin(user, tokens);
      router.replace('/(tabs)');
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [storeLogin, router, setLoading]);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    try {
      const { user, tokens } = await authService.register(data);
      await storeLogin(user, tokens);
      router.replace('/(tabs)');
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [storeLogin, router, setLoading]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore error - we still want to clear local state
    } finally {
      await storeLogout();
      router.replace('/(auth)/login');
    }
  }, [storeLogout, router]);

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      return { success: true, message: result.message };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Request failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
  };
}

export default useAuth;
