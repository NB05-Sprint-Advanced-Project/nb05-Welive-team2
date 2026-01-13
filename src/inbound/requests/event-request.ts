import { z } from 'zod';

// get events
export const getEventsReqParamsSchema = z.object({
  apartmentId: z.string(),
  year: z.number(),
  month: z.number(),
});

export const eventSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});
