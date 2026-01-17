import { z } from 'zod';
import {
  buildingSchema,
  contactSchema,
  emailSchema,
  joinedStatusSchema,
  limitSchema,
  nameSchema,
  pageSchema,
  residentSearchKeyword,
  unitSchema,
  userIdSchema,
} from './common-schema';

export const createResidentSchema = z.object({
  userId: userIdSchema,
  apartmentId: z.string(),
  email: emailSchema,
  contact: contactSchema,
  name: nameSchema,
  building: buildingSchema,
  unit: unitSchema,
  isHouseholder: z.boolean(),
});

export const updateResidentSchema = z.object({
  id: userIdSchema,
  apartmentId: z.string(),
  email: emailSchema,
  contact: contactSchema,
  name: nameSchema,
  building: buildingSchema,
  unit: unitSchema,
  isHouseholder: z.boolean(),
});

export const deleteResidentSchema = z.object({
  id: userIdSchema,
});

export const getResidentsSchema = z.object({
  userId: userIdSchema,
  page: pageSchema,
  limit: limitSchema,
  searchKeyword: residentSearchKeyword,
  building: buildingSchema,
  unit: unitSchema,
  isHouseholder: z.boolean(),
  isRegistered: z.boolean(),
});

export const getResidentSchema = z.object({
  userId: userIdSchema,
  id: userIdSchema,
});

export type CreateResidentReqDto = z.infer<typeof createResidentSchema>;
export type UpdateResidentReqDto = z.infer<typeof updateResidentSchema>;
export type DeleteResidentReqDto = z.infer<typeof deleteResidentSchema>;
export type GetResidentsReqDto = z.infer<typeof getResidentsSchema>;
export type GetResidentReqDto = z.infer<typeof getResidentSchema>;
