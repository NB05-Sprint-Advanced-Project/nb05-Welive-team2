import { PrismaClient } from '@prisma/client';
import { createGlobalErrorMiddleware } from './inbound/middlewares/global-error-middleware';
import { createNotFoundMiddleware } from './inbound/middlewares/not-found-middleware';
import { createHttpServer } from './inbound/servers/http-server';
import { createUserQueryRepo } from './outbound/repos/query/user.query.repo';
import { createUserController } from './inbound/controllers/user-controller';
import { createUserQueryService } from './application/query/services/user-query-service';
import { createUserCommandService } from './application/command/services/user-command-service';
import { createUserCommandRepo } from './outbound/repos/command/user-command-repo';
import { create } from 'node:domain';
import { createBcryptHashManager } from './outbound/managers/bcrypt-hash-manager';
import { createApartmentCommandRepo } from './outbound/repos/command/apartment-command-repo';
import { createUnitOfWork } from './outbound/unit-of-work';

export const createInjector = () => {
  const prisma = new PrismaClient();
  //util
  const unitOfwork = createUnitOfWork(prisma);

  // Middleware
  const middlewares = {
    globalError: createGlobalErrorMiddleware(),
    notFound: createNotFoundMiddleware(),
  };

  const hashManager = createBcryptHashManager();

  // Repository
  const userQueryRepository = createUserQueryRepo(prisma);
  const userCommandRepo = createUserCommandRepo(prisma);
  const apartmentCommandRepo = createApartmentCommandRepo(prisma);

  // Service
  const userQueryService = createUserQueryService(userQueryRepository);
  const userCommandService = createUserCommandService(
    unitOfwork,
    hashManager,
    userCommandRepo,
    apartmentCommandRepo,
  );

  // Controller
  const userController = createUserController(middlewares, userCommandService, userQueryService);

  const controllers = {
    // authController,
    userController,
  };

  // Server
  const httpServer = createHttpServer(middlewares, controllers);

  //  const wsServer = createWsServer(
  //   httpServer.defaultHttpServer,
  //   middlewares,
  //   gateways,
  //   utils,
  // );

  return {
    httpServer,
    // wsServer,
  };
};
