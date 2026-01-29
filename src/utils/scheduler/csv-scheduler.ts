import { getEnv } from '../../config';
import { NotificationCommandService } from '../../domain/notification/service/notification-command';
import { StateCommandService } from '../../domain/state/service/state-command';
import { UserCommandService } from '../../domain/user/service/user-command';
import { createSingleTaskScheduler } from '../../utils/scheduler-util';

export const createCSVScheduler = (
  stateCommandService: StateCommandService,
  userCommandService: UserCommandService,
  notificationCommandService: NotificationCommandService,
) => {
  let intervalId: NodeJS.Timeout | null = null;
  const intervalMs: number = getEnv().CSV_SCHEDULER_INTERVAL_MS; // 30초
  const csvRunner = createSingleTaskScheduler();

  const start = async () => {
    if (intervalId) return;

    intervalId = setInterval(async () => {
      csvRunner(async () => {
        // CSV 관련 작업 수행
        // - DB에 저장
        // 1. 상태 테이블에서 가져오기
        const pendingStatesDto = await stateCommandService.findPendingCSV();

        // 2. CSV 파일 읽기 + 파싱(파일 변환)
        await userCommandService.processCSVFiles(pendingStatesDto);

        await stateCommandService.markAsProcessedTest(pendingStatesDto);

        // 2. DB에 BULK Save
        //   * 실패하면 전체 롤백 <==(나중에!)

        //     - CSV파일 생성
        // 1. DB에서 입주민 목록 조회
        // 2. CSV 파일 생성
        // 3. CSV 파일 전송
      });
    }, intervalMs);

    console.log('csv scheduler 실행');
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    console.log('csv scheduler 중지');
  };

  return { start, stop };
};
