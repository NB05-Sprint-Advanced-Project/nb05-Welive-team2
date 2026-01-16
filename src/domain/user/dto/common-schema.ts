import { z } from 'zod';
import { Status } from '../entity/base-user';

export const createOptionSchema = z.object({
  title: z.string(),
});

export const updateOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const emailSchema = z
  .string({ message: '이메일은 문자열이어야 합니다.' })
  .min(1, { message: '이메일은 필수 항목입니다.' })
  .email({ message: '유효하지 않은 이메일입니다.' });

export const passwordSchema = z
  .string({ message: '비밀번호는 문자열이어야 합니다.' })
  .min(1, { message: '비밀번호는 필수 입력 항목입니다.' })
  .min(8, { message: '비밀번호는 최소 8자입니다.' })
  .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
  });

export const usernameSchema = z
  .string({ message: '아이디는 문자열이어야 합니다.' })
  .min(1, { message: '아이디는 필수 입력 항목입니다.' })
  .min(5, { message: '아이디는 최소 5자입니다.' });

export const nameSchema = z
  .string({ message: '이름은 문자열이어야 합니다.' })
  .min(1, { message: '이름은 필수 입력 항목입니다.' })
  .min(2, { message: '이름은 최소 2자입니다.' });

export const contactSchema = z
  .string({ message: '전화번호는 문자열이어야 합니다.' })
  .min(1, { message: '전화번호는 필수 입력 항목입니다.' })
  // 010, 02, 031(집전화) 다 가능
  .regex(/^(01[016789]|02|0[3-6][1-5])\d{7,8}$/, { message: '유효하지 않은 전화번호 형식입니다.' });

export const avatarUrlSchema = z
  .string({ message: '아바타 URL은 문자열이어야 합니다.' })
  .min(1, { message: '아바타 URL은 필수 항목입니다.' })
  .url({ message: '유효하지 않은 URL 형식입니다.' })
  .refine((url) => url.includes('.amazonaws.com/'), { message: 'S3 이미지 URL만 허용합니다.' });

export const buildingSchema = z
  .number({ message: '동(아파트 동)은 숫자이어야 합니다.' })
  .min(1, { message: '동(아파트 동)은 필수 항목입니다.' });

export const unitSchema = z
  .number({ message: '호(아파트 호수)은 숫자이어야 합니다.' })
  .min(1, { message: '호(아파트 호수)은 필수 항목입니다.' });

export const updateJoinedStatusSchema = z
  .enum(['APPROVED', 'REJECTED'])
  .transform((v) => (v === 'APPROVED' ? Status.APPROVED : Status.REJECTED));

export const JoinedStatusSchema = z.enum(Status);

// 인증 payload로 받은 userId, 존재 여부는 인증 미들웨어에서 검증됨
export const userIdSchema = z.string({ message: '유저 ID는 문자열이어야 합니다.' });
