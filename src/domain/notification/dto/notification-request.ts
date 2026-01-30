import z from 'zod';
import { userIdSchema } from '../../user/dto/common-schema';
import { Role } from '../../user/entity/base-user';

export const getNotificationsSchema = z.object({
  userId: userIdSchema,
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export const markNotificationSchema = z.object({
  userId: userIdSchema,
  notificationId: z.string(),
});

export const createNotificationSchema = z.object({
  stateId: z.string(),
  payloadId: z.string(),
  userId: z.string().optional(),
  content: z.string(),
  apartmentId: z.string().optional(),
  receiverType: z.enum(Role),
});

export type viewNotificationsDTO = z.infer<typeof getNotificationsSchema>;
export type markNotificationDTO = z.infer<typeof markNotificationSchema>;
export type createNotificationDTO = z.infer<typeof createNotificationSchema>;
