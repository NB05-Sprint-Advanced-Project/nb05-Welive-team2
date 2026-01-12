import { z } from 'zod';
import { Status } from '../../application/command/entities/user/base-user-entity';

export const viewAdministratorQuerySchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  searchKeyword: z.string().default(''),
  joinStatus: z.enum(Status).default(Status.PENDING),
});

export const createSuperAdminBodySchema = z.object({
  username: z.string(),
  email: z.string(),
  contact: z.string(),
  name: z.string(),
  password: z.string(),
});

export const createAdminBodySchema = z.object({
  username: z.string(),
  email: z.string(),
  contact: z.string(),
  name: z.string(),
  password: z.string(),
  adminOf: z.object({
    name: z.string(),
    address: z.string(),
    description: z.string(),
    officeNumber: z.string(),
    buildingNumberFrom: z.number(),
    buildingNumberTo: z.number(),
    floorCountPerBuilding: z.number(),
    unitCountPerFloor: z.number(),
  }),
});

export const updateAdminBodySchema = z.object({
  adminId: z.string(),
  email: z.string(),
  contact: z.string(),
  name: z.string(),
  adminOf: z.object({
    name: z.string(),
    address: z.string(),
    description: z.string(),
    officeNumber: z.string(),
  }),
});

export type CreateSuperAdminDto = z.infer<typeof createSuperAdminBodySchema>;
export type CreateAdminDto = z.infer<typeof createAdminBodySchema>;
export type UpdateAdminDto = z.infer<typeof updateAdminBodySchema>;
