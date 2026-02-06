import z from 'zod';
import { passwordSchema, usernameSchema } from '../../user/dto/common-schema';

export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const cookieTokenSchema = z.object({
  refreshToken: z.string().min(1, '쿠키가 필요합니다.'),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type CookieTokenDTO = z.infer<typeof cookieTokenSchema>;
