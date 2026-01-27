import { ClientManager } from '../../clients';
import { createSingleTaskScheduler } from '../../utils/scheduler-util';
import { StateProps, StatusType } from '../state/entity/state';
import { StateCommandRepo } from '../state/repo/state-command';
import { StateCommandService } from '../state/service/state-command';
import { Role } from '../user/entity/base-user';
import { NotificationCommandService } from './service/notification-command';

export const createNotificationScheduler = (
  stateCommandService: StateCommandService,
  notificationCommandService: NotificationCommandService,
) => {
  let intervalId: NodeJS.Timeout | null = null;
  const intervalMs: number = 10000; // 10초
  const notificationRunner = createSingleTaskScheduler();

  const start = async () => {
    if (intervalId) return;

    // notificationRunner(async () => {
    //     // 트랜젝션
    //     // // 1. 상태 테이블을 읽어서 처리 대기중인 알림을 가져온다
    //     // const pendingStates = await stateCommandService.findPending();

    //     // // // 2. 알림 테이블에 알림을 저장한다
    //     // // const notifications = await notificationCommandService.bulkSave(pendingStates)

    //     // // 3. payload 내용으로 SSE 알림을 전송한다
    //     // const clients = ClientManager.get()
    //     // clients.forEach((client) => {
    //     //     console.log(client);
    //     // })
    //     // // clients.forEach((client) => {
    //     // //     client.write(`event: notification\ndata: hello\n\n`);
    //     // // });
    //     // // 4. 상태 테이블 변경 (Processed)

    // });

    intervalId = setInterval(async () => {
      // 1. 상태 테이블을 읽어서 처리 대기중인 알림을 가져온다
      const pendingStatesDto = await stateCommandService.findPendingNotification();

      //  2. 알림 테이블에 알림을 저장한다
      await notificationCommandService.bulkSave(pendingStatesDto);

      // 3. payload 내용으로 SSE 알림을 전송한다
      notificationCommandService.sendLiveNotifications(pendingStatesDto);

      // 4. 상태 테이블 변경 (Processed)
      // await stateCommandService.markAsProcessed();
      console.log('==============================');
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
