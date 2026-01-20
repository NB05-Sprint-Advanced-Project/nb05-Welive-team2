import { z } from 'zod';
import { createOptionSchema, updateOptionSchema } from '../../user/dto/common-schema';

// get poll
export const getPollReqParamsSchema = z.object({
  pollId: z.string(),
});

// get all polls
export const getAllPollsReqParamsSchema = z.object({
  page: z.coerce.number().int().default(1),
  limit: z.coerce.number().int().default(10),
  searchKeyword: z.string().default(''),
  status: z.enum(['IN_PROGRESS', 'PENDING', 'CLOSED', 'ALL']).default('ALL'),
  building: z.coerce.number().int().default(0),
});

// create poll
export const createPollReqBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  apartmentId: z.string(),
  building: z.int(),
  options: z.array(createOptionSchema),
});

export type CreatePollDto = z.infer<typeof createPollReqBodySchema>;

// update poll
export const updatePollReqParamsSchema = z.object({
  pollId: z.string(),
});

export const updatePollReqBodySchema = z
  .object({
    title: z.string(),
    content: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    building: z.int(),
    options: z.array(updateOptionSchema),
  })
  .partial();

export type UpdatePollDto = z.infer<typeof updatePollReqBodySchema> &
  z.infer<typeof updatePollReqParamsSchema>;

// delete poll
export const deletePollReqParamsSchema = z.object({
  pollId: z.string(),
});

export type DeletePollDto = z.infer<typeof deletePollReqParamsSchema>;

// vote & cancle
export const voteReqParamsSchema = z.object({
  pollId: z.string(),
  optionId: z.string(),
});

export type voteDto = z.infer<typeof voteReqParamsSchema> & {
  userId: string;
};
