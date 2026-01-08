import { z } from 'zod';
import { createOptionSchema, updateOptionSchema } from './common-schema';

// get poll
export const getPollReqParamsSchema = z.object({
  pollId: z.string(),
});

// get all polls
export const getAllPollsReqParamsSchema = z.object({
  page: z.int(),
  limit: z.int(),
  searchKeyword: z.string(),
  status: z.enum(['IN_PROGRESS', 'PENDING', 'CLOSED']).default('PENDING'),
  building: z.int().default(0),
});

// create poll
export const createPollReqBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  apartmentId: z.string(),
  building: z.int(),
  options: z.array(createOptionSchema),
});

export type CreatePollDto = z.infer<typeof createPollReqBodySchema>;

// update poll
export const updatePollReqPraramsSchema = z.object({
  title: z.string(),
  content: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  building: z.int(),
  options: z.array(updateOptionSchema),
});

export type UpdatePollDto = z.infer<typeof updatePollReqPraramsSchema> & {
  pollId: string;
};

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

export type voteDto = z.infer<typeof voteReqParamsSchema>;
