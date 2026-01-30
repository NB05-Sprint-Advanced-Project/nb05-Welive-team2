import z from 'zod';
import { contactSchema, emailSchema, nameSchema } from './common-schema';

export const importResidentRowSchema = z.object({
  building: z.coerce.number().int().min(1, { message: '동은 1 이상이어야 합니다.' }),

  unit: z.coerce.number().int().min(1, { message: '호수는 1 이상이어야 합니다.' }),

  name: nameSchema,
  contact: contactSchema,
  email: emailSchema,

  isHouseholder: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : v),
    z.boolean(),
  ),
});

export const clean = (v: string) => v.replace(/^"|"$/g, '').trim();
