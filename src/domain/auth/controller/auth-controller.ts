import { createBaseController } from '../../../utils/controller-util';
import { AuthService } from '../auth-service';
import { createAuthHandlers } from './auth-handler';
import { registerAuthRoutes } from './auth-router';

export const createAuthController = (authService: AuthService) => {
  const { basePath, router } = createBaseController('/api/v2/auth');

  const handlers = createAuthHandlers(authService);

  registerAuthRoutes(router, handlers);

  return { basePath, router };
};

export type AuthController = ReturnType<typeof createAuthController>;
