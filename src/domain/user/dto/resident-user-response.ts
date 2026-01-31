import { z } from 'zod';
import {
  buildingFilterSchema,
  buildingSchema,
  contactSchema,
  emailSchema,
  isHouseholderFilterSchema,
  isRegisteredFilterSchema,
  limitSchema,
  nameSchema,
  pageSchema,
  residentSearchKeyword,
  unitFilterSchema,
  unitSchema,
  userIdSchema,
} from './common-schema';

export const createResidentUserSchema = z.object({
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
  page: pageSchema,
  limit: limitSchema,
  searchKeyword: residentSearchKeyword,
  building: buildingFilterSchema,
  unit: unitFilterSchema,
  isHouseholder: isHouseholderFilterSchema,
  isRegistered: isRegisteredFilterSchema,
});

export const getResidentSchema = z.object({
  id: userIdSchema,
});

export const exportResidentsSchema = z.object({
  searchKeyword: residentSearchKeyword,
  building: buildingFilterSchema,
  unit: unitFilterSchema,
  isHouseholder: isHouseholderFilterSchema,
  isRegistered: isRegisteredFilterSchema,
});

export type CreateResidentReqDto = z.infer<typeof createResidentUserSchema>;
export type UpdateResidentReqDto = z.infer<typeof updateResidentSchema>;
export type DeleteResidentReqDto = z.infer<typeof deleteResidentSchema>;
export type GetResidentsReqDto = z.infer<typeof getResidentsSchema>;
export type GetResidentReqDto = z.infer<typeof getResidentSchema>;
export type ExportResidentsReqDto = z.infer<typeof exportResidentsSchema>;
