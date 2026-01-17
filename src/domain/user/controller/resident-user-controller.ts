import { Middlewares } from '../../../shared/interface/i-middlewares';
import { createBaseController } from '../../../utils/controller-util';
import { UserCommandService } from '../service/user-command';
import { UserQueryService } from '../service/user-query';
import { createUserHandlers } from './user-handler';
import { registerUserRoutes } from './user-router';

export const createResidentUserController = (
  middlewares: Middlewares,
  userCommandService: UserCommandService,
  userQueryService: UserQueryService,
) => {
  const { path, router } = createBaseController('/api/v2/residents');

  const handlers = createUserHandlers(middlewares, userCommandService, userQueryService);

  registerUserRoutes(router, handlers);

  return { path, router };
};

export type ResidentUserController = ReturnType<typeof createResidentUserController>;
