import { State } from '@prisma/client';
import {
  createNotificationDTO,
  readNotificationDTO,
  viewNotificationsDTO,
} from '../dto/notification-request';
import { INotificationCommandRepo } from '../interface/i-notification-command';
import { NotificationStateProps, StateProps, WorkType } from '../../state/entity/state';
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

    // 각 클라이언트에게 알맞는 알림 전송 ( O (N^2) 문제 필요 )
    dtos.map((dto) => {
      const payload = [
        {
          id: `${dto.payloadId}-${dto.receiverType}`,
          createdAt: '2026-01-28T01:49:17.566Z',
          content: `[SSE 실시간 알림 전송됨] ${dto.content}`,
          isChecked: false,
        },
      ];

      // const payload ={
      //   type: "alarm",
      //   data: [
      //     {
      //       id: "string",
      //       createdAt: "2026-01-28T01:49:17.566Z",
      //       content: "string",
      //       isChecked: true
      //     }
      //   ]
      // }

      if (dto.receiverType === Role.SUPER_ADMIN) {
        superAdmins?.forEach((connection, user) => {
          console.log('SSE 알림 전송 대상 : ', user);
          connection.write(`event: ${WorkType.ALARM}\ndata: ${JSON.stringify(payload)}\n\n`);
        });
      } else if (dto.receiverType === Role.ADMIN) {
        admins?.forEach((connection, user) => {
          connection.write(`event: ${WorkType.ALARM}\ndata: ${dto.content}\n\n`);
        });
      } else if (dto.receiverType === Role.USER) {
        residents?.forEach((connection, user) => {
          connection.write(`event: ${WorkType.ALARM}\ndata: ${dto.content}\n\n`);
        });
      }
    });
    //   const grouped = {
    //     [Role.SUPER_ADMIN]: [] as StateResponseDto[],
    //     [Role.ADMIN]: [] as StateResponseDto[],
    //     [Role.USER]: [] as StateResponseDto[],
    //   };

    //   dtos.forEach((dto) => {
    //     grouped[dto.receiverType]?.push(dto);
    //   });

    //   const send = (
    //     connections: Map<string, any> | undefined,
    //     payload: StateResponseDto[],
    //   ) => {
    //     if (!connections || payload.length === 0) return;

    //     const now = new Date();

    //     const message = {
    //       type: 'alarm',
    //       data: payload.map((dto) => ({
    //         id: dto.id,
    //         createdAt: now,
    //         content: dto.content,
    //         isChecked: false,
    //       })),
    //     };

    //     const serialized = JSON.stringify(message);

    //     connections.forEach((connection) => {
    //       connection.write(
    //         `event: ${WorkType.ALARM}\n` +
    //         `data: ${serialized}\n\n`
    //       );
    //     });
    //   };

    //   send(superAdmins, grouped[Role.SUPER_ADMIN]);
    //   send(admins, grouped[Role.ADMIN]);
    //   send(residents, grouped[Role.USER]);
  };
  
  return {
    markAsRead,
    bulkSave,
    sendLiveNotifications,
  };
};

export type NotificationCommandService = ReturnType<typeof createNotificationCommandService>;
