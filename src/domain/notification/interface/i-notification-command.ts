export interface INotificationCommandRepo {
  markAsRead(notificationId: string): Promise<void>;
}
