import { z } from 'zod';

export const createOptionSchema = z.object({
  title: z.string(),
});

export const updateOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
});