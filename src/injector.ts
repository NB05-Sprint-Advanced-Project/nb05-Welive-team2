import { PrismaClient } from '@prisma/client';
import { createGlobalErrorMiddleware } from './inbound/middlewares/global-error-middleware';
import { createNotFoundMiddleware } from './inbound/middlewares/not-found-middleware';
import { createHttpServer } from './inbound/servers/http-server';
import { loadConfig } from './shared/utils/config-util';
import { createUserQueryRepo } from './outbound/repos/query/user.query.repo';
import { createUserController } from './inbound/controllers/user-controller';
import { createUserQueryService } from './application/query/services/user-query-service';

export const createInjector = () => {
  const config = loadConfig();
  console.log('Configuration loaded:', config);

  const utils = {
    config,
  };

  const prisma = new PrismaClient();

  // Middleware
  const middlewares = {
    globalError: createGlobalErrorMiddleware(utils),
    notFound: createNotFoundMiddleware(),
  };

  // Repository
  const userQueryRepository = createUserQueryRepo(prisma);

  // Service
  const userQueryService = createUserQueryService(userQueryRepository);

  // Controller
  const userController = createUserController(middlewares, userQueryService);

  const controllers = {
    // authController,
    userController,
  };

  // Server
  const httpServer = createHttpServer(middlewares, controllers, utils);

  //  const wsServer = createWsServer(
  //   httpServer.defaultHttpServer,
  //   middlewares,
  //   gateways,
  //   utils,
  // );

  return {
    httpServer,
    // wsServer,
    utils,
  };
};
