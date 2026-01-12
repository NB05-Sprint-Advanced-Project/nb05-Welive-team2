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
export const updateNoticeReqParamsSchema = z.object({
  noticeId: z.string(),
});

export const updateNoticeReqBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.enum(['MAINTENCE', 'URGENT', 'COMMUNITY', 'VOTING', 'BOARD_MEETING', 'ETC']),
  isPinned: z.boolean(),
  event: eventSchema.optional(),
});

export type UpdateNoticeDto = z.infer<typeof updateNoticeReqBodySchema> &
  z.infer<typeof updateNoticeReqParamsSchema>;

// delete notice
export const deleteNoticeReqParamsSchema = z.object({
  noticeId: z.string(),
});

export type DeleteNoticeDto = z.infer<typeof deleteNoticeReqParamsSchema>;
