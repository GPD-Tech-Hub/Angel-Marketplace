import { config } from '@/constants/config';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

type KingsChatTokens = {
  accessToken: string;
  refreshToken?: string;
};

type KingsChatAuthErrorCode =
  | 'CONFIG_MISSING'
  | 'AUTH_CANCELLED'
  | 'INVALID_CALLBACK';

export class KingsChatAuthError extends Error {
  code: KingsChatAuthErrorCode;

  constructor(code: KingsChatAuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

class KingsChatService {
  private getCallbackBaseUrl(): string {
    return config.API_URL.replace(/\/+$/, '');
  }

  private getOauthUrl(appRedirectUri: string) {
    const extra = Constants.expoConfig?.extra as
      | {
          kingschatOauthUrl?: string;
          kingschatAuthBaseUrl?: string;
          kingschatClientId?: string;
          kingschat?: {
            oauthUrl?: string;
            authBaseUrl?: string;
            clientId?: string;
          };
        }
      | undefined;

    const directOauthUrl =
      extra?.kingschatOauthUrl ?? extra?.kingschat?.oauthUrl ?? '';

    if (directOauthUrl) {
      if (directOauthUrl.includes('redirect_uri=')) {
        return directOauthUrl;
      }

      const separator = directOauthUrl.includes('?') ? '&' : '?';
      return `${directOauthUrl}${separator}redirect_uri=${encodeURIComponent(appRedirectUri)}`;
    }

    const authBaseUrl =
      extra?.kingschatAuthBaseUrl ??
      extra?.kingschat?.authBaseUrl ??
      'https://accounts.kingsch.at';
    const clientId =
      extra?.kingschatClientId ??
      extra?.kingschat?.clientId ??
      'com.kingschat';

    if (!authBaseUrl || !clientId) {
      throw new KingsChatAuthError('CONFIG_MISSING', 'KingsChat config missing');
    }

    const callbackUrl =
      `${this.getCallbackBaseUrl()}/auth/kingschat/callback` +
      `?app_redirect=${encodeURIComponent(appRedirectUri)}`;

    const params = new URLSearchParams({
      client_id: clientId,
      scopes: JSON.stringify(['kingschat', 'profile']),
      redirect_uri: callbackUrl,
      response_type: 'token',
      post_redirect: 'true',
    });

    return `${authBaseUrl}?${params.toString()}`;
  }

  private getTokenFromUrl(url: string): KingsChatTokens | null {
    const parsed = Linking.parse(url);
    const queryParams = (parsed.queryParams ?? {}) as Record<string, unknown>;

    const getString = (value: unknown) =>
      typeof value === 'string' && value.trim() ? value.trim() : undefined;

    const parsePayload = (value: unknown) => {
      if (typeof value !== 'string') {
        return {} as Record<string, unknown>;
      }

      try {
        return JSON.parse(value) as Record<string, unknown>;
      } catch {
        return {} as Record<string, unknown>;
      }
    };

    const payload = {
      ...parsePayload(queryParams.data),
      ...parsePayload(queryParams.payload),
      ...parsePayload(queryParams.tokenData),
    };

    const urlObject = new URL(url);
    const hashParams = new URLSearchParams(urlObject.hash.replace(/^#/, ''));

    const accessToken =
      getString(queryParams.accessToken) ??
      getString(queryParams.access_token) ??
      getString(queryParams.token) ??
      getString(payload.accessToken) ??
      getString(payload.access_token) ??
      getString(hashParams.get('accessToken')) ??
      getString(hashParams.get('access_token'));

    if (!accessToken) {
      return null;
    }

    const refreshToken =
      getString(queryParams.refreshToken) ??
      getString(queryParams.refresh_token) ??
      getString(payload.refreshToken) ??
      getString(payload.refresh_token) ??
      getString(hashParams.get('refreshToken')) ??
      getString(hashParams.get('refresh_token'));

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(): Promise<KingsChatTokens> {
    const appRedirectUri = Linking.createURL('kingschat-callback');
    const oauthUrl = this.getOauthUrl(appRedirectUri);

    const result = await WebBrowser.openAuthSessionAsync(oauthUrl, appRedirectUri);

    if (result.type !== 'success') {
      throw new KingsChatAuthError(
        'AUTH_CANCELLED',
        'KingsChat login was cancelled'
      );
    }

    const tokenData = this.getTokenFromUrl(result.url);

    if (!tokenData?.accessToken) {
      throw new KingsChatAuthError(
        'INVALID_CALLBACK',
        'No authentication data received'
      );
    }

    return tokenData;
  }
}

export const kingsChatService = new KingsChatService();

export default kingsChatService;
