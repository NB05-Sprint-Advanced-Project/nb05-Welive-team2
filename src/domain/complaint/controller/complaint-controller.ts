import { Middlewares } from '../../../shared/interface/i-middlewares';
import { createBaseController } from '../../../utils/controller-util';
import { ComplaintCommandService } from '../service/complaint-command';
import { ComplaintQueryService } from '../service/complaint-query';
import { createComplaintHandlers } from './complaint-handler';
import { registerComplaintRouters } from './complaint-router';

export const createComplaintController = (
  middlewares: Middlewares,
  complaintQueryService: ComplaintQueryService,
  complaintCommandService: ComplaintCommandService,
) => {
  const { path, router } = createBaseController('/api/v2/users');

  const handlers = createComplaintHandlers(
    middlewares,
    complaintQueryService,
    complaintCommandService,
  );

  registerComplaintRouters(router, handlers);

  return { path, router };
};

export type ComplaintController = ReturnType<typeof createComplaintController>;
