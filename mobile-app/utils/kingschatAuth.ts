import { AxiosError } from 'axios';
import { authService, kingsChatService, KingsChatAuthError } from '@/services';
import { useAuthStore } from '@/store';

export async function completeKingsChatAuth(): Promise<void> {
  const { accessToken } = await kingsChatService.login();
  const { user, tokens } = await authService.loginWithKingsChat(accessToken);
  await useAuthStore.getState().login(user, tokens);
}

export function getKingsChatErrorMessage(err: unknown, fallback: string): string | null {
  if (err instanceof KingsChatAuthError && err.code === 'AUTH_CANCELLED') {
    return null;
  }

  if (err instanceof KingsChatAuthError) {
    return err.message;
  }

  if (err instanceof AxiosError && err.response?.data?.message) {
    return String(err.response.data.message);
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
}
