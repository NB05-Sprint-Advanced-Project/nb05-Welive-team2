import { z } from 'zod';
import dotenv from 'dotenv';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.url(),
  PORT: z.coerce.number(),
  COOKIE_SECRET: z.string().min(10, '세션 아이디 비밀번호는 최소 10자 이상입니다.'),
  TOKEN_SECRET: z.string().min(10, '토큰 시크릿은 최소 10자 이상입니다.'),
  ACCESS_TOKEN_EXPIRES_IN: z.enum(['15m', '1h']).default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.enum(['7d']).default('7d'),
  CLIENT_DOMAIN: z.string(),
  JSON_LIMIT: z.string(),
  MAX_RETRIES: z.coerce.number(),
  OPTIMISTIC_LOCK_RETRY_DELAY_MS: z.coerce.number(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
});

type EnvParsed = z.infer<typeof envSchema>;

export const getEnv = (): EnvParsed => {
  let parsed: z.infer<typeof envSchema>;

  dotenv.config({
    path:
      process.env.NODE_ENV === 'development'
        ? '.env.dev'
        : process.env.NODE_ENV === 'test'
          ? '.env.test'
          : '.env.prod',
  });

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(result.error.issues[0].path + ': ' + result.error.issues[0].message);
  }

  return result.data;
};
