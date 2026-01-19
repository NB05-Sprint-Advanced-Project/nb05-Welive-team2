import { Middlewares } from '../../../shared/interface/i-middlewares';
import { createBaseController } from '../../../utils/controller-util';
import { UserCommandService } from '../service/user-command';
import { UserQueryService } from '../service/user-query';
import { createResidentUserHandlers } from './resident-user-handler';
import { registerResidentUserRoutes } from './resident-user-router';

export const createResidentUserController = (
  middlewares: Middlewares,
  userCommandService: UserCommandService,
  userQueryService: UserQueryService,
) => {
  const { path, router } = createBaseController('/api/v2/residents');

  const handlers = createResidentUserHandlers(userCommandService, userQueryService);

  registerResidentUserRoutes(router, handlers, middlewares);

  return { path, router };
};

export type ResidentUserController = ReturnType<typeof createResidentUserController>;
