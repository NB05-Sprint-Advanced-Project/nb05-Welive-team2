import { z } from 'zod';
import {
  avatarUrlSchema,
  buildingSchema,
  contactSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  unitSchema,
  userIdSchema,
  usernameSchema,
  joinedStatusSchema,
  pageSchema,
  limitSchema,
  residentAccountSearchKeyword,
  joinedStatusFilterSchema,
  buildingFilterSchema,
  unitFilterSchema,
} from './common-schema';

// 관리자
export const viewAdministratorSchema = z.object({
  userId: userIdSchema,
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  searchKeyword: z.string().default(''),
  joinStatus: joinedStatusSchema.optional(),
});

export const createSuperAdminSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  contact: contactSchema,
  name: nameSchema,
  password: passwordSchema,
});

export const createAdminSchema = z.object({
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

export const updateAdminsJoinStatusesSchema = z.object({
  joinStatus: joinedStatusSchema,
});

export const updateAdminJoinStatusSchema = z.object({
  id: userIdSchema,
  joinStatus: joinedStatusSchema,
});

export const deleteAdminSchema = z.object({
  adminId: userIdSchema,
});

export type CreateSuperAdminDto = z.infer<typeof createSuperAdminSchema>;
export type CreateAdminDto = z.infer<typeof createAdminSchema>;
export type UpdateAdminDto = z.infer<typeof updateAdminSchema>;
export type UpdateAdminjoinedStatusesDto = z.infer<typeof updateAdminsJoinStatusesSchema>;
export type UpdateAdminjoinedStatusDto = z.infer<typeof updateAdminJoinStatusSchema>;
export type DeleteAdminDto = z.infer<typeof deleteAdminSchema>;

// 입주민 계정
export const signUpResidentAccountSchema = z.object({
  username: usernameSchema,
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

// 단건
export const updateResidentAccountJoinedStatusSchema = z.object({
  id: userIdSchema,
  joinStatus: joinedStatusSchema,
});

// 다건
export const updateResidentAccountJoinedStatusesSchema = z.object({
  userId: userIdSchema,
  joinStatus: joinedStatusSchema,
});

const deleteResidentAccountSchema = z.object({
  userId: userIdSchema, // 관리자 id
  id: z.string(), // 입주민 계정 id
});

export const getResidentAccountsSchema = z.object({
  userId: userIdSchema,
  page: pageSchema,
  limit: limitSchema,
  searchKeyword: residentAccountSearchKeyword,
  joinStatus: joinedStatusFilterSchema,
  building: buildingFilterSchema,
  unit: unitFilterSchema,
});

export type SignUpResidentAccountReqDto = z.infer<typeof signUpResidentAccountSchema>;
export type UpdateResidentAccountJoinedStatusReqDto = z.infer<
  typeof updateResidentAccountJoinedStatusSchema
>;
export type UpdateResidentAccountJoinedStatusesReqDto = z.infer<
  typeof updateResidentAccountJoinedStatusesSchema
>;
export type DeleteResidentAccountReqDto = z.infer<typeof deleteResidentAccountSchema>;
export type GetResidentAccountsReqDto = z.infer<typeof getResidentAccountsSchema>;

// 기타
export const updateAvatarUrlSchema = z.object({
  userId: userIdSchema,
  avatarUrl: avatarUrlSchema,
});

export const updatePasswordSchema = z.object({
  userId: userIdSchema,
  password: passwordSchema,
  newPassword: passwordSchema,
});

export type UpdateAvatarUrlReqDto = z.infer<typeof updateAvatarUrlSchema>;
export type UpdatePasswordReqDto = z.infer<typeof updatePasswordSchema>;
