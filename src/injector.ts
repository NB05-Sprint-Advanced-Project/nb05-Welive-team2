import { PrismaClient } from '@prisma/client';
import { createUserQueryRepo } from './domain/user/repo/user-query';
import { createUserQueryService } from './domain/user/service/user-query';
import { createUserCommandService } from './domain/user/service/user-command';
import { createUserCommandRepo } from './domain/user/repo/user-command';
import { createBcryptHashManager } from './managers/bcrypt-hash-manager';
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
import { createGlobalErrorMiddleware } from './middlewares/global-error-middleware';
import { createNotFoundMiddleware } from './middlewares/not-found-middleware';
import { createHttpServer } from './servers/http-server';
import { TokenUtil } from './shared/utils/token-manager';
import { createUserController } from './domain/user/controller/user-controller';
import { createAuthController } from './domain/auth/controller/auth-controller';
import { createAuthService } from './domain/auth/auth-service';
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
import { createApartmentQueryRepo } from './domain/apartment/repo/apartment-query';
import { createApartmentQueryService } from './domain/apartment/service/apartment-query';
import { createApartmentCommandRepo } from './domain/apartment/repo/apartment-command';
import { createApartmentController } from './domain/apartment/controller/apartment-controller';
import { createNoticeController } from './domain/notice/controller/notice-controller';
import { createPollController } from './domain/poll/controller/poll-controller';
import { createAuthMiddleware } from './middlewares/auth-middleware';
import { createRedisExternal } from './redis';
import { createResidentUserController } from './domain/user/controller/resident-user-controller';
import { createRedisLocker } from './managers/redis-locker';
import { createNoticeBatchService } from './domain/notice/service/notice-batch';
import { createNoticeScheduler } from './domain/notice/notice-scheduler';
import { createNotificationController } from './domain/notification/controller/notification-controller';
import { createNotificationQueryRepo } from './domain/notification/repo/notification-query';
import { createNotificationQueryService } from './domain/notification/service/notification-query';
import { createNotificationCommandService } from './domain/notification/service/notification-command';
import { createNotificationCommandRepo } from './domain/notification/repo/notification-command';
import { createComplaintScheduler } from './domain/complaint/complaint-scheduler';
import { createComplaintBatchService } from './domain/complaint/service/complaint-batch';
import { createStateCommandRepo } from './domain/state/repo/state-command';
import { createNotificationScheduler } from './domain/notification/notification-scheduler';
import { createStateCommandService } from './domain/state/service/state-command';
import { createMulterMiddleware } from './middlewares/multer-middleware';

export const createInjector = (mockPrisma?: PrismaClient) => {
  const prisma = mockPrisma ?? new PrismaClient();
  //util
  const unitOfwork = createUnitOfWork(prisma);
  const tokenManager = TokenUtil();
  const redisExternal = createRedisExternal();
  const redisLocker = createRedisLocker(redisExternal);

  // Middleware
  const middlewares = {
    globalError: createGlobalErrorMiddleware(),
    notFound: createNotFoundMiddleware(),
    auth: createAuthMiddleware(tokenManager, redisExternal),
    // multer: createMulterMiddleware(),
  };

  const hashManager = createBcryptHashManager();

  // Repository
  const userQueryRepository = createUserQueryRepo(prisma);
  const userCommandRepo = createUserCommandRepo(prisma);

  const apartmentQueryRepo = createApartmentQueryRepo(prisma);
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

  const notificationQueryRepository = createNotificationQueryRepo(prisma);
  const notificationCommandRepository = createNotificationCommandRepo(prisma);
  const stateCommandRepository = createStateCommandRepo(prisma);

  // Service
  const apartmentQueryService = createApartmentQueryService(apartmentQueryRepo, redisLocker);

  const userQueryService = createUserQueryService(userQueryRepository, redisLocker);
  const userCommandService = createUserCommandService(
    unitOfwork,
    hashManager,
    userCommandRepo,
    apartmentCommandRepo,
    stateCommandRepository,
    redisExternal,
  );

  const pollQuerService = createPollQueryService(pollQueryRepository, redisExternal, redisLocker);
  const pollCommandService = createPollCommandService(
    unitOfwork,
    pollCommandRepository,
    userVoteOptionCommandRepository,
    stateCommandRepo,
  );

  const noticeQueryService = createNoticeQueryService(
    noticeQueryRepository,
    redisExternal,
    redisLocker,
  );
  const noticeCommandService = createNoticeCommandService(
    unitOfwork,
    noticeCommandRepository,
    stateCommandRepo,
  );
  const noticeBatchService = createNoticeBatchService(noticeCommandRepository, redisExternal);

  const complaintQueryService = createComplaintQueryService(
    redisLocker,
    redisExternal,
    complaintQueryRepository,
  );
  const complaintCommandService = createComplaintCommandService(
    unitOfwork,
    redisExternal,
    complaintCommandRepository,
    stateCommandRepository,
  );
  const complaintBatchService = createComplaintBatchService(
    redisExternal,
    complaintCommandRepository,
  );
  const stateCommandService = createStateCommandService(stateCommandRepository);

  const commentQueryService = createCommentQueryService(commentQueryRepository);
  const commentCommandService = createCommentCommandService(unitOfwork, commentCommandRepository);
  const authService = createAuthService(userQueryRepository, hashManager, tokenManager);

  const notificationQueryService = createNotificationQueryService(notificationQueryRepository);

  const notificationCommandService = createNotificationCommandService(
    notificationCommandRepository,
    userCommandRepo,
  );

  // Controller
  const residentController = createResidentUserController(
    middlewares,
    userCommandService,
    userQueryService,
  );

  const authController = createAuthController(authService);
  const userController = createUserController(middlewares, userCommandService, userQueryService);
  const residentUserController = createResidentUserController(
    middlewares,
    userCommandService,
    userQueryService,
  );
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

  const apartmentController = createApartmentController(apartmentQueryService);
  const notificationController = createNotificationController(
    notificationQueryService,
    notificationCommandService,
    middlewares,
  );

  const controllers = {
    authController,
    userController,
    residentUserController,
    pollController,
    noticeController,
    complaintController,
    commentController,
    apartmentController,
    residentController,
    notificationController,
  };

  // Scheduler
  const noticeScheduler = createNoticeScheduler(noticeBatchService);
  const complaintScheduler = createComplaintScheduler(complaintBatchService);
  const notificationScheduler = createNotificationScheduler(
    stateCommandService,
    notificationCommandService,
  );

  // Server
  const httpServer = createHttpServer(middlewares, controllers);

  return {
    httpServer,
    redisExternal,
    noticeScheduler,
    hashManager,
    complaintScheduler,
    notificationScheduler,
  };
};
