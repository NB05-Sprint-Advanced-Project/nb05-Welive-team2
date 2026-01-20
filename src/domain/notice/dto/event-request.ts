import { z } from 'zod';

// get events
export const getEventsReqParamsSchema = z.object({
  apartmentId: z.string(),
  year: z.coerce.number().int(),
  month: z.coerce.number().int(),
});

export const eventSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
