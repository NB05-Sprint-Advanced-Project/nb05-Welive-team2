import { createNotificationDTO, markNotificationDTO } from '../dto/notification-request';
import { INotificationCommandRepo } from '../interface/i-notification-command';
import { ClientManager } from '../../../clients';
import { IUserCommandRepo } from '../../user/interface/i-user-command-repo';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { isTechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { NotificationMapper } from '../notification-mapper';

export const createNotificationCommandService = (
  notificationCommandRepo: INotificationCommandRepo,
  userCommandRepo: IUserCommandRepo,
) => {
  const markAsRead = async (dto: markNotificationDTO) => {
    try {
      await notificationCommandRepo.markAsRead(dto.notificationId);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.RECORD_NOT_FOUND) {
          throw BusinessException({
            type: BusinessExceptionType.NOTIFICATION_NOT_FOUND,
          });
        }
      }
      throw err;
    }
  };

  const bulkSave = async (dtos: createNotificationDTO[]) => {
    try {
      const filteredDtos = dtos.filter(
        (dto) => dto.receiverType === 'SUPER_ADMIN' || dto.apartmentId,
      );

      const roleApartmentMap = new Map(
        filteredDtos.map((dto) => [
          `${dto.receiverType}-${dto.apartmentId}`,
          { role: dto.receiverType, apartmentId: dto.apartmentId },
        ]),
      );

      const roleApartmentPairs = Array.from(roleApartmentMap.values());

      const usersByRoleAndApartment = await Promise.all(
        roleApartmentPairs.map(({ role, apartmentId }) => {
          if (role === 'SUPER_ADMIN') {
            return userCommandRepo.findByRole(role);
          }

          if (!apartmentId) {
            throw BusinessException({
              type: BusinessExceptionType.INVALID_REQUEST,
            });
          }

          return userCommandRepo.findByRoleAndApartmentId(role, apartmentId);
        }),
      );

      const users = usersByRoleAndApartment.flat();

      const notifications = NotificationMapper.createNotifications(filteredDtos, users);

      await notificationCommandRepo.bulkSave(notifications);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_NOTIFICATION) {
          console.log('중복 알림 발생, 무시합니다.');
          return;
        }
      }
      throw err;
    }
  };

  const sendLiveNotifications = async (dtos: createNotificationDTO[]) => {
    const { superAdmins, admins, residents } = ClientManager.get();

    const { superAdminPayloads, adminPayloads, userPayloads } =
      NotificationMapper.createLivePayloads(dtos);

    if (superAdminPayloads.length !== 0) {
      console.log('슈퍼 관리자에게 알림 전송:', superAdminPayloads.length);
      ClientManager.send(superAdmins, superAdminPayloads);
    }

    if (adminPayloads.length !== 0) {
      console.log('관리자에게 알림 전송:', adminPayloads.length);
      ClientManager.send(admins, adminPayloads);
    }

    if (userPayloads.length !== 0) {
      console.log('입주민에게 알림 전송:', userPayloads.length);
      ClientManager.send(residents, userPayloads);
    }
  };

  const deleteOldNotification = async () => {
    await notificationCommandRepo.delete();
  };

  return {
    markAsRead,
    bulkSave,
    sendLiveNotifications,
    deleteOldNotification,
  };
};

export type NotificationCommandService = ReturnType<typeof createNotificationCommandService>;
