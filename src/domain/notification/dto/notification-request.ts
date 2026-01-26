import z from 'zod';
import { userIdSchema } from '../../user/dto/common-schema';

export const getNotificationsSchema = z.object({
  userId: userIdSchema,
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export const readNotificationSchema = z.object({
  userId: userIdSchema,
  notificationId: z.string(),
});

export type viewNotificationsDTO = z.infer<typeof getNotificationsSchema>;
export type readNotificationDTO = z.infer<typeof readNotificationSchema>;
