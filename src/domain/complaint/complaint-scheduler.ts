import { createSingleTaskScheduler } from '../../utils/scheduler-util';
import { ComplaintBatchService } from './service/complaint-batch';

export const createComplaintScheduler = (service: ComplaintBatchService) => {
  let intervalId: NodeJS.Timeout | null = null;
  const intervalMs: number = 6000;
  const complaintRunner = createSingleTaskScheduler();

  const start = () => {
    if (intervalId) return;

    complaintRunner(() => service.syncViewCounts());

    intervalId = setInterval(async () => {
      complaintRunner(() => service.syncViewCounts());
    }, intervalMs);

    console.log('complaint scehduler 실행');
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    console.log('complaint scheduler 중지');
  };

  return { start, stop };
};
