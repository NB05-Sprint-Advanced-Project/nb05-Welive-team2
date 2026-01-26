import { NotificationView } from '../dto/view/notification-view';

export interface INotificationQueryRepo {
  findManyById(params: { userId: string; page: number; limit: number }): Promise<NotificationView>;
  //   findById(apartmentId: string): Promise<ApartmentView | null>;
  //   findAll(page: number, limit: number, searchKeyword: string): Promise<ApartmentsView | null>;
}
