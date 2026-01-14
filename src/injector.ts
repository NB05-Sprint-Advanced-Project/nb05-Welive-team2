import { PrismaClient } from '@prisma/client';
import { createGlobalErrorMiddleware } from './inbound/middlewares/global-error-middleware';
import { createNotFoundMiddleware } from './inbound/middlewares/not-found-middleware';
import { createHttpServer } from './inbound/servers/http-server';
import { createUserQueryRepo } from './outbound/repos/query/user.query.repo';
import { createUserController } from './inbound/controllers/user-controller';
import { createUserQueryService } from './application/query/services/user-query-service';
import { createUserCommandService } from './application/command/services/user-command-service';
import { createUserCommandRepo } from './outbound/repos/command/user-command-repo';
import { createBcryptHashManager } from './outbound/managers/bcrypt-hash-manager';
import { createApartmentCommandRepo } from './outbound/repos/command/apartment-command-repo';
import { createUnitOfWork } from './outbound/unit-of-work';
import { createPollQueryRepo } from './outbound/repos/query/poll-query-repo';
import { createPollCommandRepo } from './outbound/repos/command/poll-command-repo';
import { createNoticeQueryRepo } from './outbound/repos/query/notice-query-repo';
import { createNoticeCommandRepo } from './outbound/repos/command/notice-command-repo';
import { createPollQueryService } from './application/query/services/poll-query-service';
import { createPollCommandService } from './application/command/services/poll-command-service';
import { createUserVoteOptionCommandRepo } from './outbound/repos/command/user-vote-option-command-repo';
import { createNoticeQueryService } from './application/query/services/notice-query-service';
import { createNoticeCommandService } from './application/command/services/notice-command-service';
import { createPollController } from './inbound/controllers/poll-controller';
import { createNoticeController } from './inbound/controllers/notice-controller';

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

  const pollQueryRepository = createPollQueryRepo(prisma);
  const pollCommandRepository = createPollCommandRepo(prisma);
  const userVoteOptionCommandRepository = createUserVoteOptionCommandRepo(prisma);

  const noticeQueryRepository = createNoticeQueryRepo(prisma);
  const noticeCommandRepository = createNoticeCommandRepo(prisma);

  // Service
  const userQueryService = createUserQueryService(userQueryRepository);
  const userCommandService = createUserCommandService(
    unitOfwork,
    hashManager,
    userCommandRepo,
    apartmentCommandRepo,
  );

  const pollQuerService = createPollQueryService(pollQueryRepository);
  const pollCommandService = createPollCommandService(
    unitOfwork,
    pollCommandRepository,
    userVoteOptionCommandRepository,
  );

  const noticeQueryService = createNoticeQueryService(noticeQueryRepository);
  const noticeCommandService = createNoticeCommandService(unitOfwork, noticeCommandRepository);

  // Controller
  const userController = createUserController(middlewares, userCommandService, userQueryService);
  const pollController = createPollController(middlewares, pollQuerService, pollCommandService);
  const noticeController = createNoticeController(
    middlewares,
    noticeQueryService,
    noticeCommandService,
  );

  const controllers = {
    // authController,
    userController,
    pollController,
    noticeController,
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
