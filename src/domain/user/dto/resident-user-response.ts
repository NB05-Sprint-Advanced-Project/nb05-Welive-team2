import { z } from 'zod';
import {
  buildingFilterSchema,
  buildingSchema,
  contactSchema,
  emailSchema,
  joinedStatusSchema,
  limitSchema,
  nameSchema,
  pageSchema,
  residentSearchKeyword,
  unitFilterSchema,
  unitSchema,
  userIdSchema,
} from './common-schema';

export const createResidentUserSchema = z.object({
  userId: userIdSchema,
  apartmentId: z.string(),
  email: emailSchema,
  contact: contactSchema,
  name: nameSchema,
  building: buildingSchema,
  unit: unitSchema,
  isHouseholder: z.string(),
});

export const updateResidentSchema = z.object({
  id: userIdSchema,
  email: emailSchema,
  contact: contactSchema,
  name: nameSchema,
  building: buildingSchema,
  unit: unitSchema,
  isHouseholder: z.string(),
});

export const deleteResidentSchema = z.object({
  id: userIdSchema,
});

export const getResidentsSchema = z.object({
  userId: userIdSchema,
  page: pageSchema,
  limit: limitSchema,
  searchKeyword: residentSearchKeyword,
  building: buildingFilterSchema,
  unit: unitFilterSchema,
  isHouseholder: z.string().optional(),
  isRegistered: z.string().optional(),
});

export const getResidentSchema = z.object({
  userId: userIdSchema,
  id: userIdSchema,
});

export type CreateResidentReqDto = z.infer<typeof createResidentUserSchema>;
export type UpdateResidentReqDto = z.infer<typeof updateResidentSchema>;
export type DeleteResidentReqDto = z.infer<typeof deleteResidentSchema>;
export type GetResidentsReqDto = z.infer<typeof getResidentsSchema>;
export type GetResidentReqDto = z.infer<typeof getResidentSchema>;
