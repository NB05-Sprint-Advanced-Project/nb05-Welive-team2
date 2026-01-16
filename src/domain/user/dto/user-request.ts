import { z } from 'zod';
import {
  avatarUrlSchema,
  buildingSchema,
  contactSchema,
  emailSchema,
  updateJoinedStatusSchema,
  nameSchema,
  passwordSchema,
  unitSchema,
  userIdSchema,
  usernameSchema,
  JoinedStatusSchema,
} from './common-schema';
import { Status } from '../entity/base-user';

// 관리자
// 관리자 계정
export const viewAdministratorQuerySchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  searchKeyword: z.string().default(''),
  joinStatus: JoinedStatusSchema.default(Status.PENDING),
});

export const createSuperAdminBodySchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  contact: contactSchema,
  name: nameSchema,
  password: passwordSchema,
});

export const createAdminBodySchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  contact: contactSchema,
  name: nameSchema,
  password: passwordSchema,
  adminOf: z.object({
    name: nameSchema,
    address: z.string(),
    description: z.string(),
    officeNumber: z.string(),
    buildingNumberFrom: buildingSchema,
    buildingNumberTo: buildingSchema,
    floorCountPerBuilding: z.number(),
    unitCountPerFloor: unitSchema,
  }),
});

export const updateAdminSchema = z.object({
  adminId: userIdSchema,
  email: emailSchema,
  contact: contactSchema,
  name: nameSchema,
  adminOf: z.object({
    name: nameSchema,
    address: z.string(),
    description: z.string(),
    officeNumber: z.string(),
  }),
});

export const updateAdminjoinedStatusesSchema = z.object({
  joinStatus: updateJoinedStatusSchema,
});

export const updateAdminjoinedStatusSchema = z.object({
  id: userIdSchema,
  joinStatus: updateJoinedStatusSchema,
});

export type CreateSuperAdminDto = z.infer<typeof createSuperAdminBodySchema>;
export type CreateAdminDto = z.infer<typeof createAdminBodySchema>;
export type UpdateAdminDto = z.infer<typeof updateAdminSchema>;
export type UpdateAdminjoinedStatusesDto = z.infer<typeof updateAdminjoinedStatusesSchema>;
export type UpdateAdminjoinedStatusDto = z.infer<typeof updateAdminjoinedStatusSchema>;

// 입주민
// 입주민 계정
export const signUpResidentAccountSchema = z.object({
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

export const updateResidentAccountSchema = z.object({
  userId: userIdSchema,
  name: nameSchema,
  email: emailSchema,
  contact: contactSchema,
  building: buildingSchema,
  unit: unitSchema,
  isHouseholder: z.boolean(),
});

// 단건
export const updateResidentAccountJoinedStatusSchema = z.object({
  userId: userIdSchema,
  joindeStatus: updateJoinedStatusSchema,
});

// 다건
export const updateResidentAccountJoinedStatusesSchema = z.object({
  joindeStatus: updateJoinedStatusSchema,
});

export const updateResidentAccountAvatarUrlSchema = z.object({
  avatarUrl: avatarUrlSchema,
});

export const updateResidentAccountPasswordSchema = z.object({
  password: passwordSchema,
  newpassword: passwordSchema,
});

const deleteResidentAccountSchema = z.object({
  userId: userIdSchema, // 관리자 id
  id: z.string(), // 입주민 계정 id
});

export type SignUpResidentAccountReqDto = z.infer<typeof signUpResidentAccountSchema>;
export type UpdateResidentAccountReqDto = z.infer<typeof updateResidentAccountSchema>;
export type UpdateResidentAccountJoinedStatusReqDto = z.infer<
  typeof updateResidentAccountJoinedStatusSchema
>;
export type UpdateResidentAccountJoinedStatusesReqDto = z.infer<
  typeof updateResidentAccountJoinedStatusesSchema
>;
// export type UpdateResidentAccountAvatarUrlReqDto = z.infer<
//   typeof updateResidentAccountAvatarUrlSchema
// >;
// export type UpdateResidentAccountPasswordReqDto = z.infer<
//   typeof updateResidentAccountPasswordSchema
// >;
export type DeleteResidentAccountReqDto = z.infer<typeof deleteResidentAccountSchema>;

// 입주민(가입한 입주민 + 미가입한 입주민)
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
  userId: userIdSchema,
  name: nameSchema,
  email: emailSchema,
  contact: contactSchema,
  building: buildingSchema,
  unit: unitSchema,
  isHouseholder: z.boolean(),
});

const deleteResidentSchema = z.object({
  userId: userIdSchema,
  id: z.string(),
});

export type CreateResidentReqDto = z.infer<typeof createResidentSchema>;
export type UpdateResidentReqDto = z.infer<typeof updateResidentSchema>;
export type DeleteResidentReqDto = z.infer<typeof deleteResidentSchema>;

// 기타
export const updateAvatarUrlSchema = z.object({
  userId: userIdSchema,
  avatarUrl: avatarUrlSchema,
});

export const updatePasswordSchema = z.object({
  userId: userIdSchema,
  password: passwordSchema,
  newpassword: passwordSchema,
});

export type UpdateAvatarUrlReqDto = z.infer<typeof updateAvatarUrlSchema>;
export type UpdatePasswordReqDto = z.infer<typeof updatePasswordSchema>;
