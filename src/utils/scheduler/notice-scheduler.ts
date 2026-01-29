import { NoticeBatchService } from '../../domain/notice/service/notice-batch';
import { createSingleTaskScheduler } from '../../utils/scheduler-util';

export const createNoticeScheduler = (service: NoticeBatchService) => {
  let intervalId: NodeJS.Timeout | null = null;
  const intervalMs: number = 6000;
  const noticeRunner = createSingleTaskScheduler();

  const start = () => {
    if (intervalId) return;

    noticeRunner(() => service.syncViewCounts());

    intervalId = setInterval(async () => {
      noticeRunner(() => service.syncViewCounts());
    }, intervalMs);

    console.log('notice scehduler 실행');
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    console.log('notice scheduler 중지');
  };

  return { start, stop };
};
