import z from 'zod';

export const getApartmentSchema = z.object({
  apartmentId: z.string(),
});

export const getApartmentsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  searchKeyword: z.string().default(''),
});

export type viewApartmentDTO = z.infer<typeof getApartmentSchema>;
export type viewApartmentsDTO = z.infer<typeof getApartmentsSchema>;
