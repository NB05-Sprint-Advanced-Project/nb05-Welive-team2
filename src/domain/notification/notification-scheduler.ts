import { getEnv } from '../../config';
import { createSingleTaskScheduler } from '../../utils/scheduler-util';
import { StateCommandService } from '../state/service/state-command';
import { NotificationCommandService } from './service/notification-command';

export const createNotificationScheduler = (
  stateCommandService: StateCommandService,
  notificationCommandService: NotificationCommandService,
) => {
  let intervalId: NodeJS.Timeout | null = null;
  const intervalMs: number = getEnv().NOTIFICATION_SCHEDULER_INTERVAL_MS;
  const notificationRunner = createSingleTaskScheduler();

  const start = async () => {
    if (intervalId) return;

    intervalId = setInterval(async () => {
      notificationRunner(async () => {
        // 1. 상태 테이블을 읽어서 처리 대기중인 알림을 가져온다
        const pendingStatesDto = await stateCommandService.findPendingNotification();

        //  2. 알림 테이블에 알림을 저장한다
        await notificationCommandService.bulkSave(pendingStatesDto);

        // 3. payload 내용으로 SSE 알림을 전송한다
        await notificationCommandService.sendLiveNotifications(pendingStatesDto);

        // 4. 상태 테이블 변경 (Processed)
        await stateCommandService.markAsProcessed(pendingStatesDto);
      });
    }, intervalMs);

    console.log('notification scheduler 실행');
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    console.log('notification scheduler 중지');
  };

  return { start, stop };
};
