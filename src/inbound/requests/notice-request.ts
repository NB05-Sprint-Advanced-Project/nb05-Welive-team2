import { z } from 'zod';
import { eventSchema } from './common-schema';

// get notice
export const getNoticeReqParamsSchema = z.object({
  noticeId: z.string(),
});

// get all notice
export const getAllNoticesReqParamsSchema = z.object({
  page: z.int(),
  limit: z.int(),
  searchKeyword: z.string(),
  category: z.enum(['MAINTENCE', 'URGENT', 'COMMUNITY', 'VOTING', 'BOARD_MEETING', 'ETC']),
});

// create notice
export const createNoticeReqBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.enum(['MAINTENCE', 'URGENT', 'COMMUNITY', 'VOTING', 'BOARD_MEETING', 'ETC']),
  isPinned: z.boolean(),
  apartmentId: z.string(),
  event: eventSchema.optional(),
});

export type CreateNoticeDto = z.infer<typeof createNoticeReqBodySchema>;

// update notice
export type UpdateNoticeDto = z.infer<typeof createNoticeReqBodySchema> & {
  noticeId: string;
};

// delete notice
export type DeleteNoticeDto = { noticeId: string };
