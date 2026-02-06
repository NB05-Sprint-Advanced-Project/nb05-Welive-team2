import { StateResponseDto } from '../state/dto/state-response';
import { LiveNotificationPayload } from '../state/entity/state';
import { BaseAllUserProps, Role } from '../user/entity/base-user';
import { createNotificationDTO } from './dto/notification-request';
import { NotificationEntity, NotificationProps } from './entity/notification';

type ApartmentPayloads = {
  adminsPayloads: LiveNotificationPayload[];
  residentsPayloads: LiveNotificationPayload[];
  individualPayloads: Map<string, LiveNotificationPayload[]>;
};

export const NotificationMapper = {
  createLivePayloads: (dtos: createNotificationDTO[]) => {
    const superAdminPayloads: LiveNotificationPayload[] = [];
    const payloadsByAptAndRole = new Map<string, ApartmentPayloads>();

    dtos.forEach((dto) => {
      const payload = {
        id: `${dto.payloadId}-${dto.receiverType}`,
        createdAt: new Date().toISOString(),
        content: `[new] ${dto.content}`,
        isChecked: false,
      };

      if (dto.receiverType === Role.SUPER_ADMIN) {
        superAdminPayloads.push(payload);
      } else {
        // 역할 전체 알림
        if (!dto.apartmentId) return;
        const aptId = dto.apartmentId;

        if (!payloadsByAptAndRole.has(aptId)) {
          payloadsByAptAndRole.set(aptId, {
            adminsPayloads: [],
            residentsPayloads: [],
            individualPayloads: new Map(),
          });
        }
        const aptPayloads = payloadsByAptAndRole.get(aptId)!;

        if (dto.receiverType === Role.ADMIN) {
          aptPayloads.adminsPayloads.push(payload);
        }
        if (dto.receiverType === Role.USER) {
          aptPayloads.residentsPayloads.push(payload);
        }
        if (dto.receiverType === Role.INDIVIDUAL_USER) {
          if (!dto.userId) return;
          const aptId = dto.apartmentId;

          if (!payloadsByAptAndRole.has(aptId)) {
            payloadsByAptAndRole.set(aptId, {
              adminsPayloads: [],
              residentsPayloads: [],
              individualPayloads: new Map(),
            });
          }

          const aptPayloads = payloadsByAptAndRole.get(aptId)!;

          if (!aptPayloads.individualPayloads.has(dto.userId)) {
            aptPayloads.individualPayloads.set(dto.userId, []);
          }
          aptPayloads.individualPayloads.get(dto.userId)!.push(payload);
        }
      }
    });

    return { superAdminPayloads, payloadsByAptAndRole };
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
