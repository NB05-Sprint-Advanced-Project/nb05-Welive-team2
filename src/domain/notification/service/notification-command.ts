import { State } from '@prisma/client';
import {
  createNotificationDTO,
  readNotificationDTO,
  viewNotificationsDTO,
} from '../dto/notification-request';
import { INotificationCommandRepo } from '../interface/i-notification-command';
import {
  LiveNotificationPayload,
  NotificationStateProps,
  StateProps,
  WorkType,
} from '../../state/entity/state';
import { ClientManager } from '../../../clients';
import { Role } from '../../user/entity/base-user';
import { StateResponseDto } from '../../state/dto/state-response';
import { NotificationEntity, NotificationProps } from '../entity/notification';
import { getEnv } from '../../../config';
import { IUserCommandRepo } from '../../user/interface/i-user-command-repo';

export const createNotificationCommandService = (
  notificationCommandRepo: INotificationCommandRepo,
  userCommandRepo: IUserCommandRepo,
) => {
  const markAsRead = async (dto: readNotificationDTO) => {
    await notificationCommandRepo.markAsRead(dto.notificationId);
    return;
  };

  const bulkSave = async (states: StateResponseDto[]) => {
    const notifications: NotificationProps[] = [];

    for (const state of states) {
      const users = await userCommandRepo.findUserByRole(state.receiverType);

      for (const user of users) {
        const notification = NotificationEntity.create({
          id: state.payloadId + '-' + user.id,
          receiverId: user.id ? user.id : undefined,
          content: state.content,
        });

        notifications.push(notification);
      }
    }

    const batchSize = getEnv().BULK_NOTIFICATION_SIZE;

    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      await notificationCommandRepo.bulkSave(batch);
    }
  };

  const sendLiveNotifications = async (dtos: StateResponseDto[]) => {
    // SSE에 접속한 모든 클라이언트 정보 가져옴
    const clients = ClientManager.get();

    const superAdmins = clients.get(Role.SUPER_ADMIN);
    const admins = clients.get(Role.ADMIN);
    const residents = clients.get(Role.USER);

    const superAdminPayloads: LiveNotificationPayload[] = [];
    const adminPayloads: LiveNotificationPayload[] = [];
    const userPayloads: LiveNotificationPayload[] = [];

    const startTime = Date.now();
    dtos.map((dto) => {
      const payload = {
        id: `${dto.payloadId}-${dto.receiverType}`,
        createdAt: '2026-01-28T01:49:17.566Z',
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

    if (superAdminPayloads.length !== 0) {
      superAdmins?.forEach((connection, user) => {
        connection.write(
          `event: ${WorkType.ALARM}\ndata: ${JSON.stringify(superAdminPayloads)}\n\n`,
        );
      });
    }

    if (adminPayloads.length === 0 && userPayloads.length === 0) {
      admins?.forEach((connection, user) => {
        connection.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(adminPayloads)}\n\n`);
      });
    }

    if (userPayloads.length === 0) {
      residents?.forEach((connection, user) => {
        connection.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(userPayloads)}\n\n`);
      });
    }
    const endTime = Date.now();
    console.log(`sendLiveNotifications 실행 시간: ${endTime - startTime}ms`);
  };

  return {
    markAsRead,
    bulkSave,
    sendLiveNotifications,
  };
};

export type NotificationCommandService = ReturnType<typeof createNotificationCommandService>;
