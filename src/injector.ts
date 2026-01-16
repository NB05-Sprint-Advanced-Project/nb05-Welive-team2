import { PrismaClient } from '@prisma/client';
import { createUserQueryRepo } from './domain/user/repo/user-query';
import { createUserQueryService } from './domain/user/service/user-query';
import { createUserCommandService } from './domain/user/service/user-command';
import { createUserCommandRepo } from './domain/user/repo/user-command';
import { createBcryptHashManager } from './managers/bcrypt-hash-manager';
import { createApartmentCommandRepo } from './domain/apartment/apartment-command-repo';
import { createUnitOfWork } from './managers/unit-of-work';
import { createPollQueryRepo } from './domain/poll/repo/poll-query';
import { createPollCommandRepo } from './domain/poll/repo/poll-command';
import { createNoticeQueryRepo } from './domain/notice/repo/notice-query';
import { createNoticeCommandRepo } from './domain/notice/repo/notice-command';
import { createPollQueryService } from './domain/poll/service/poll-query';
import { createPollCommandService } from './domain/poll/service/poll-command';
import { createUserVoteOptionCommandRepo } from './domain/user-vote-option/user-vote-option-command-repo';
import { createNoticeQueryService } from './domain/notice/service/notice-query';
import { createNoticeCommandService } from './domain/notice/service/notice-command';
import { createPollController } from './domain/poll/poll-controller';
import { createNoticeController } from './domain/notice/controller/notice';
import { createGlobalErrorMiddleware } from './middlewares/global-error-middleware';
import { createNotFoundMiddleware } from './middlewares/not-found-middleware';
import { createHttpServer } from './servers/http-server';
import { TokenUtil } from './shared/utils/token-manager';
import { createUserController } from './domain/user/controller/user-controller';
import { createCommentController } from './domain/comment/controller/comment-controller';
import { createCommentCommandRepo } from './domain/comment/repo/comment-command';
import { createCommentQueryRepo } from './domain/comment/repo/comment-query';
import { createCommentCommandService } from './domain/comment/service/comment-command';
import { createCommentQueryService } from './domain/comment/service/comment-query';
import { createComplaintController } from './domain/complaint/controller/complaint-controller';
import { createComplaintCommandRepo } from './domain/complaint/repo/complaint-command';
import { createComplaintQueryRepo } from './domain/complaint/repo/complaint-query';
import { createComplaintCommandService } from './domain/complaint/service/complaint-command';
import { createComplaintQueryService } from './domain/complaint/service/complaint-query';

export const createInjector = () => {
  const prisma = new PrismaClient();
  //util
  const unitOfwork = createUnitOfWork(prisma);
  const tokenManager = TokenUtil();

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

  const complaintQueryRepository = createComplaintQueryRepo(prisma);
  const complaintCommandRepository = createComplaintCommandRepo(prisma);

  const commentQueryRepository = createCommentQueryRepo(prisma);
  const commentCommandRepository = createCommentCommandRepo(prisma);

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

  const complaintQueryService = createComplaintQueryService(complaintQueryRepository);
  const complaintCommandService = createComplaintCommandService(
    unitOfwork,
    complaintCommandRepository,
  );

  const commentQueryService = createCommentQueryService(commentQueryRepository);
  const commentCommandService = createCommentCommandService(unitOfwork, commentCommandRepository);

  // Controller
  const userController = createUserController(middlewares, userCommandService, userQueryService);
  const pollController = createPollController(middlewares, pollQuerService, pollCommandService);

  const noticeController = createNoticeController(
    middlewares,
    noticeQueryService,
    noticeCommandService,
  );
  const complaintController = createComplaintController(
    middlewares,
    complaintQueryService,
    complaintCommandService,
  );
  const commentController = createCommentController(
    middlewares,
    commentQueryService,
    commentCommandService,
  );

  const controllers = {
    userController,
    pollController,
    noticeController,
    complaintController,
    commentController,
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
