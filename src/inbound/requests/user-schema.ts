import { z } from 'zod';
import {
  avatarUrlSchema,
  buildingSchema,
  contactSchema,
  emailSchema,
  joinedStatusSchma,
  nameSchema,
  passwordSchema,
  unitSchema,
} from './common-schema';

// 관리자

// 입주민
export type CreateResidentAccountReqDto = z.infer<typeof createResidentAccountSchema>;
export type UpdateResidentAccountReqDto = z.infer<typeof updateResidentAccountSchema>;
export type UpdateResidentAccountJoinedStatusReqDto = z.infer<
  typeof updateResidentAccountJoinedStatusSchema
>;
export type UpdateResidentAccountJoinedStatusesReqDto = z.infer<
  typeof updateResidentAccountJoinedStatusesSchema
>;
export type UpdateResidentAccountAvatarUrlReqDto = z.infer<
  typeof updateResidentAccountAvatarUrlSchema
>;
export type UpdateResidentAccountPasswordReqDto = z.infer<
  typeof updateResidentAccountPasswordSchema
>;
export type DeleteResidentAccountReqDto = z.infer<typeof deleteResidentAccountSchema>;

const createResidentAccountSchema = z.object({
  username: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  email: emailSchema,
  contact: contactSchema,
  resident: z.object({
    apartmentId: z.string(),
    building: buildingSchema,
    unit: unitSchema,
  }),
});

const updateResidentAccountSchema = z.object({
  userId: z.string(),
  name: nameSchema,
  email: emailSchema,
  contact: contactSchema,
  building: buildingSchema,
  unit: unitSchema,
  isHouseholder: z.boolean(),
});

// 단건
const updateResidentAccountJoinedStatusSchema = z.object({
  userId: z.string(),
  joindeStatus: joinedStatusSchma,
});

// 다건
const updateResidentAccountJoinedStatusesSchema = z.object({
  joindeStatus: joinedStatusSchma,
});

const updateResidentAccountAvatarUrlSchema = z.object({
  avatarUrl: avatarUrlSchema,
});

const updateResidentAccountPasswordSchema = z.object({
  password: passwordSchema,
  newpassword: passwordSchema,
});

const deleteResidentAccountSchema = z.object({
  userId: z.string(), // 관리자 id
  id: z.string(), // 입주민 계정 id
});

// 미가입된 입주민
export type CreateResidentReqDto = z.infer<typeof createResidentSchema>;
export type UpdateResidentReqDto = z.infer<typeof updateResidentSchema>;
export type deleteResidentReqDto = z.infer<typeof deleteResidentSchema>;

const createResidentSchema = z.object({
  apartmentId: z.string(),
  name: nameSchema,
  email: emailSchema,
  contact: contactSchema,
  building: buildingSchema,
  unit: unitSchema,
  isHouseHolder: z.boolean,
});

const updateResidentSchema = z.object({
  userId: z.string(),
  name: nameSchema,
  email: emailSchema,
  contact: contactSchema,
  building: buildingSchema,
  unit: unitSchema,
  isHouseholder: z.boolean(),
});

const deleteResidentSchema = z.object({
  userId: z.string(),
  id: z.string(),
});
