import { z } from 'zod';
import { Status } from '../../application/command/entities/user/base-user-entity';
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  contactSchema,
  buildingSchema,
  unitSchema,
  joinedStatusSchma,
  avatarUrlSchema,
  usernameSchema,
} from './common-schema';

// 관리자
export const viewAdministratorQuerySchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  searchKeyword: z.string().default(''),
  joinStatus: joinedStatusSchma.default(Status.PENDING),
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

export const updateAdminBodySchema = z.object({
  adminId: z.string(),
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

export const approveAdminBodySchema = z.object({
  joinStatus: joinedStatusSchma,
});

export type CreateSuperAdminDto = z.infer<typeof createSuperAdminBodySchema>;
export type CreateAdminDto = z.infer<typeof createAdminBodySchema>;
export type UpdateAdminDto = z.infer<typeof updateAdminBodySchema>;

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
