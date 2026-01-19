import { Middlewares } from '../../../shared/interface/i-middlewares';
import { createBaseController } from '../../../utils/controller-util';
import { PollCommandService } from '../service/poll-command';
import { PollQueryService } from '../service/poll-query';
import { createPollHandler } from './poll-handler';
import { registerPollRoutes } from './poll-router';

export const createPollController = (
  middlewares: Middlewares,
  pollQueryService: PollQueryService,
  pollCommandService: PollCommandService,
) => {
  const { path, router } = createBaseController('/api/v2/polls');

  const handler = createPollHandler(middlewares, pollQueryService, pollCommandService);

  registerPollRoutes(router, handler);

  return { path, router };
};

export type PollController = ReturnType<typeof createPollController>;
