import { z } from 'zod';

// query
export const getAllConplaintsReqQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),
    searchKeyword: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']).optional(),
    isPublic: z
      .preprocess((value) => {
        if (value === undefined) return undefined;
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
      }, z.boolean())
      .optional(),
    building: z.coerce.number().optional(),
    unit: z.coerce.number().optional(),
  }),
});

export const getComplaintReqParamsSchema = z.object({
  params: z.object({ complaintId: z.string() }),
});

// command
export const createComplaintReqBodySchema = z.object({
  body: z.object({
    title: z.string().min(1, '제목을 입력해주세요.'),
    content: z.string().min(1, '내용을 입력해주세요.'),
    isPublic: z.boolean().default(true),
    apartmentId: z.string(),
  }),
});

export const updateComplaintReqBodySchema = z.object({
  params: z.object({ complaintId: z.string() }),

  body: z.object({
    title: z.string().min(1, '제목을 입력해주세요.'),
    content: z.string().min(1, '내용을 입력해주세요.'),
    isPublic: z.boolean().default(true),
  }),
});

export const deleteComplaintReqParamsSchema = z.object({
  params: z.object({ complaintId: z.string() }),
});

// update status (관리자)
export const updateComplaintStatusReqBodySchema = z.object({
  params: z.object({ complaintId: z.string() }),

  body: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']).default('PENDING'),
  }),
});

export type GetAllComplaintsDto = z.infer<typeof getAllConplaintsReqQuerySchema>;

export type GetComplaintDto = z.infer<typeof getComplaintReqParamsSchema>;

export type CreateComplaintDto = z.infer<typeof createComplaintReqBodySchema>;

export type UpdateComplaintDto = z.infer<typeof updateComplaintReqBodySchema>;

export type DeleteComplaintDto = z.infer<typeof deleteComplaintReqParamsSchema>;

export type UpdateComplaintStatusDto = z.infer<typeof updateComplaintStatusReqBodySchema>;
