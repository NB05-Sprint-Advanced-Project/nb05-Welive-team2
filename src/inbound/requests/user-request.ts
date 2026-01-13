import { z } from 'zod';
import {
  avatarUrlSchema,
  buildingSchema,
  contactSchema,
  emailSchema,
  joinedStatusSchema,
  nameSchema,
  passwordSchema,
  unitSchema,
  userIdSchema,
} from './common-schema';
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

<<<<<<< HEAD
// 관리자
=======
// 관리자 계정
>>>>>>> b04d14d ([feat] command 서비스 ing~)
export const viewAdministratorQuerySchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  searchKeyword: z.string().default(''),
  joinStatus: joinedStatusSchma.default(Status.PENDING),
});

export const createSuperAdminBodySchema = z.object({
<<<<<<< HEAD
  username: usernameSchema,
  email: emailSchema,
  contact: contactSchema,
  name: nameSchema,
  password: passwordSchema,
=======
  username: z.string(),
  email: emailSchema,
  contact: z.string(),
  name: z.string(),
  password: z.string(),
>>>>>>> b04d14d ([feat] command 서비스 ing~)
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

<<<<<<< HEAD
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
=======
// 입주민 계정
export const signUpResidentAccountSchema = z.object({
>>>>>>> b04d14d ([feat] command 서비스 ing~)
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

<<<<<<< HEAD
const updateResidentAccountSchema = z.object({
  userId: z.string(),
=======
export const updateResidentAccountSchema = z.object({
  userId: userIdSchema,
>>>>>>> b04d14d ([feat] command 서비스 ing~)
  name: nameSchema,
  email: emailSchema,
  contact: contactSchema,
  building: buildingSchema,
  unit: unitSchema,
  isHouseholder: z.boolean(),
});

// 단건
<<<<<<< HEAD
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

=======
export const updateResidentAccountJoinedStatusSchema = z.object({
  userId: userIdSchema,
  joindeStatus: joinedStatusSchema,
});

// 다건
export const updateResidentAccountJoinedStatusesSchema = z.object({
  joindeStatus: joinedStatusSchema,
});

export const deleteResidentAccountSchema = z.object({
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
export type DeleteResidentAccountReqDto = z.infer<typeof deleteResidentAccountSchema>;

// 입주민(가입한 입주민 + 미가입한 입주민)
>>>>>>> b04d14d ([feat] command 서비스 ing~)
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
<<<<<<< HEAD
  userId: z.string(),
=======
  userId: userIdSchema,
>>>>>>> b04d14d ([feat] command 서비스 ing~)
  name: nameSchema,
  email: emailSchema,
  contact: contactSchema,
  building: buildingSchema,
  unit: unitSchema,
  isHouseholder: z.boolean(),
});

const deleteResidentSchema = z.object({
<<<<<<< HEAD
  userId: z.string(),
  id: z.string(),
});
=======
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
>>>>>>> b04d14d ([feat] command 서비스 ing~)
