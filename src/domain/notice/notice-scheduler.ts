import { createSingleTaskScheduler } from '../../utils/scheduler-util';
import { NoticeBatchService } from './service/notice-batch';

export const createNoticeScheduler = (service: NoticeBatchService) => {
  let intervalId: NodeJS.Timeout | null = null;
  const intervalMs: number = 6000;
  const noticeRunner = createSingleTaskScheduler();

  const start = () => {
    if (intervalId) return;

    noticeRunner(() => service.syncViewsCounts());

    intervalId = setInterval(async () => {
      noticeRunner(() => service.syncViewsCounts());
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
