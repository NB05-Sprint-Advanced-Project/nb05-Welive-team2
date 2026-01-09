import { z } from 'zod';

// query
export const getAllConplaintsReqParamsSchema = z.object({
  params: z.object({
    page: z.number(),
    limit: z.number(),
    searchKeyword: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']),
    isPublic: z.boolean(),
    building: z.number().optional(),
    unit: z.number().optional(),
  }),
});

export const getComplaintReqParamsSchema = z.object({
  params: z.object({ complaintId: z.string() }),
});

// command
export const createComplaintReqBodySchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
  isPublic: z.boolean(),
  apartmentId: z.string(),
});

export const updateComplaintReqBodySchema = z.object({
  params: z.object({ complaintId: z.string() }),

  body: z.object({
    title: z.string().min(1, '제목을 입력해주세요.'),
    content: z.string().min(1, '내용을 입력해주세요.'),
    isPublic: z.boolean().optional(),
  }),
});

export const deleteComplaintReqParamsSchema = z.object({
  params: z.object({ complaintId: z.string() }),
});

// update status (관리자)
export const updateComplaintStatusReqBodySchema = z.object({
  params: z.object({ complaintId: z.string() }),

  body: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']),
  }),
});

export type GetAllComplaintsDto = z.infer<typeof getAllConplaintsReqParamsSchema>;

export type GetComplaintDto = z.infer<typeof getComplaintReqParamsSchema>;

export type CreateComplaintDto = z.infer<typeof createComplaintReqBodySchema>;

export type UpdateComplaintDto = z.infer<typeof updateComplaintReqBodySchema>;

export type DeleteComplaintDto = z.infer<typeof deleteComplaintReqParamsSchema>;

export type UpdateComplaintStatusDto = z.infer<typeof updateComplaintStatusReqBodySchema>;
