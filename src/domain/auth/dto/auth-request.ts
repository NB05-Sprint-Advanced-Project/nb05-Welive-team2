import z from 'zod';
import { passwordSchema, usernameSchema } from '../../user/dto/common-schema';

export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const cookieTokenSchema = z.object({
  cookie: z
    .string()
    .min(1, '쿠키가 필요합니다.')
    .regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/, '유효한 토큰 형식이 아닙니다.'),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type CookieTokenDTO = z.infer<typeof cookieTokenSchema>;
