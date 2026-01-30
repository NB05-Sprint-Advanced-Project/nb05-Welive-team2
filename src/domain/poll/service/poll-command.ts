import { CreatePollDto, DeletePollDto, UpdatePollDto, voteDto } from '../dto/poll-request';
import { IUnitOfWork } from '../../../shared/interface/i-unit-of-work';
import { IPollCommandRepo } from '../interface/i-poll-command-repo';
import { IUserVoteOptionCommandRepo } from '../../user-vote-option/i-user-vote-option-command-repo';
import { PollEntity, PollProps } from '../entity/poll';
import { UserVoteOptionEntity } from '../../user-vote-option/user-vote-option-entity';
import { isTechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { Prisma } from '@prisma/client';
import { StateEntity, StatusType, WorkType } from '../../state/entity/state';
import { randomUUID } from 'crypto';
import { Role } from '../../user/entity/base-user';
import { IStateCommandRepo } from '../../state/interface/i-state-command-repo';

export const createPollCommandService = (
  uow: IUnitOfWork,
  pollCommandRepo: IPollCommandRepo,
  userVoteOptionCommandRepo: IUserVoteOptionCommandRepo,
  stateRepo: IStateCommandRepo,
) => {
  const createPoll = async (dto: CreatePollDto, userId: string): Promise<PollProps> => {
    try {
      return await uow.doWork(
        async () => {
          const poll = await pollCommandRepo.create(
            PollEntity.create({
              ...dto,
            }),
            userId,
          );

          const stateEntity = StateEntity.create({
            workType: WorkType.ALARM,
            status: StatusType.PENDING,
            payload: {
              id: randomUUID(),
              receiverType: Role.USER,
              message: `[투표] ${poll.title} 등록됨`,
            } as unknown as JSON,
          });

          await stateRepo.create(stateEntity);

          return poll;
        },
        {
          transactionOptions: { useTransaction: true, isolationLevel: 'ReadCommitted' },
          useOptimisticLock: false,
        },
      );
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.FOREIGN_KEY_VIOLATION) {
          throw BusinessException({
            type: BusinessExceptionType.FAIL_SAVE_POLL,
          });
        }
      }
      throw err;
    }
  };

  const updatePoll = async (dto: UpdatePollDto): Promise<void> => {
    try {
      return await uow.doWork(async () => {
        const { pollId, ...data } = dto;
        const foundPoll = await pollCommandRepo.findById(pollId);
        if (!foundPoll) {
          throw BusinessException({
            type: BusinessExceptionType.POLL_NOT_FOUND,
          });
        }
        await pollCommandRepo.update(PollEntity.update(foundPoll, { ...data }));
      });
    } catch (err) {
      if (isTechnicalException(err)) {
        throw BusinessException({
          type: BusinessExceptionType.FAIL_SAVE_POLL,
        });
      }
      throw err;
    }
  };

  const deletePoll = async (dto: DeletePollDto): Promise<void> => {
    return await uow.doWork(
      async () => {
        const { pollId } = dto;
        await pollCommandRepo.deletePoll(pollId);
      },
      {
        transactionOptions: { useTransaction: true, isolationLevel: 'ReadCommitted' },
        useOptimisticLock: false,
      },
    );
  };

  const vote = async (dto: voteDto): Promise<void> => {
    try {
      return await uow.doWork(
        async () => {
          const { optionId, userId } = dto;
          await userVoteOptionCommandRepo.vote(UserVoteOptionEntity.create({ optionId, userId }));
        },
        {
          transactionOptions: { useTransaction: true, isolationLevel: 'ReadCommitted' },
          useOptimisticLock: true,
        },
      );
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw BusinessException({
          type: BusinessExceptionType.ALREADY_VOTED,
        });
      }
      throw err;
    }
  };

  const cancle = async (dto: voteDto): Promise<void> => {
    return await uow.doWork(
      async () => {
        const { optionId, userId } = dto;
        await userVoteOptionCommandRepo.cancle(optionId, userId);
      },
      {
        transactionOptions: { useTransaction: true, isolationLevel: 'ReadCommitted' },
        useOptimisticLock: false,
      },
    );
  };
  return {
    createPoll,
    updatePoll,
    deletePoll,
    vote,
    cancle,
  };
};

export type PollCommandService = ReturnType<typeof createPollCommandService>;
