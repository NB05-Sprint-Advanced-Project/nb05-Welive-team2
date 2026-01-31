import { StateResponseDto } from '../state/dto/state-response';
import { LiveNotificationPayload } from '../state/entity/state';
import { BaseAllUserProps, Role } from '../user/entity/base-user';
import { NotificationEntity, NotificationProps } from './entity/notification';

export const NotificationMapper = {
  createLivePayloads: (dtos: StateResponseDto[]) => {
    const superAdminPayloads: LiveNotificationPayload[] = [];
    const adminPayloads: LiveNotificationPayload[] = [];
    const userPayloads: LiveNotificationPayload[] = [];

    dtos.map((dto) => {
      const payload = {
        id: `${dto.payloadId}-${dto.receiverType}`,
        createdAt: new Date().toISOString(),
        content: `[SSE 실시간 알림 전송됨] ${dto.content}`,
        isChecked: false,
      };

      if (dto.receiverType === Role.SUPER_ADMIN) {
        superAdminPayloads.push(payload);
      } else if (dto.receiverType === Role.ADMIN) {
        adminPayloads.push(payload);
      } else if (dto.receiverType === Role.USER) {
        userPayloads.push(payload);
      }
    });

    return { superAdminPayloads, adminPayloads, userPayloads };
  },

  createNotifications: (dtos: StateResponseDto[], users: BaseAllUserProps[]) => {
    const notifications: NotificationProps[] = [];

    for (const dto of dtos) {
      for (const user of users) {
        const notification = NotificationEntity.create({
          id: dto.payloadId + '-' + user.id,
          receiverId: user.id ? user.id : undefined,
          content: dto.content,
        });
        notifications.push(notification);
      }
    }

    return notifications;
  },

  createNotificationData: (notifications: NotificationProps[]) => {
    return notifications.map((notification) => ({
      id: notification.id,
      userId: notification.receiverId,
      content: notification.content,
      isChecked: notification.isChecked,
      createdAt: notification.createdAt,
    }));
  },
};
