import { z } from 'zod';



export const createSuperAdminBodySchema = z.object({
    username: z.string(),
    email: z.string(),
    contact: z.string(),
    name: z.string(),
    password: z.string()
});

export type CreateSuperAdminDto = z.infer<typeof createSuperAdminBodySchema>;




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
        unitCountPerFloor: z.number()
    })
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
        officeNumber: z.string()
    })
});



export type CreateAdminDto = z.infer<typeof createAdminBodySchema>;
export type UpdateAdminDto = z.infer<typeof updateAdminBodySchema>;