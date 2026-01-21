import { createSingleTaskScheduler } from '../../utils/scheduler-util';
import { ComplaintCommandService } from './service/complaint-command';

export const complaintScheduler = (service: ComplaintCommandService) => {
  const complaintRunner = createSingleTaskScheduler();

  setInterval(() => {
    complaintRunner(() => service.syncViewCounts());
  }, 6000);
};
