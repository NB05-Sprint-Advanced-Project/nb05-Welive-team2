import { IRedisExternal } from '../../../shared/interface/i-redis';
import { createBaseController } from '../../../shared/utils/controller-util';
import { AuthService } from '../auth-service';
import { createAuthHandlers } from './auth-handler';
import { registerAuthRoutes } from './auth-router';

export const createAuthController = (authService: AuthService, redisExternal: IRedisExternal) => {
  const { basePath, router } = createBaseController('/api/v2/auth');

  const handlers = createAuthHandlers(authService, redisExternal);

  registerAuthRoutes(router, handlers);

  return { basePath, router };
};

export type AuthController = ReturnType<typeof createAuthController>;
