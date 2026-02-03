import { NotificationProps } from '../entity/notification';

export interface INotificationCommandRepo {
  markAsRead(notificationId: string): Promise<void>;
  bulkSave(bulk: NotificationProps[]): Promise<void>;
  delete(): Promise<void>;
}
