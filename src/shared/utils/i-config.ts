import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number(),
  PUBLIC_PATH: z.string().default('public'),
  DATABASE_URL: z.url(),
  IMAGE_BASE_URL: z.url(),
  COOKIE_SECRET: z.string().min(10, '세션 아이디 비밀번호는 최소 10자 이상입니다.'),
  TOKEN_SECRET: z.string().min(10, '토큰 시크릿은 최소 10자 이상입니다.'),
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_SECRET: z.string(),
  GOOGLE_OAUTH_REDIRECT_URI: z.url(),
  GOOGLE_SIGN_IN_SESSION_EXPIRED_URL: z.url(),
  GOOGLE_SIGN_IN_SUCCESS_URL: z.url(),
  GOOGLE_ACCOUNT_LINK_SUCCESS_URL: z.url(),
  ACCESS_TOKEN_EXPIRES_IN: z.enum(['15m', '1h']).default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.enum(['7d']).default('7d'),
  CLIENT_DOMAIN: z.string(),
  JSON_LIMIT: z.coerce.number(),
  MAX_RETRIES: z.coerce.number(),
  OPTIMISTIC_LOCK_RETRY_DELAY_MS: z.coerce.number(),
});

export type ConfigType = z.infer<typeof configSchema>;
