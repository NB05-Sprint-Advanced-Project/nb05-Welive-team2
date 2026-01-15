import {
  CreatePollDto,
  DeletePollDto,
  UpdatePollDto,
  voteDto,
} from '../../../inbound/requests/poll-request';
import { IUnitOfWork } from '../../ports/i-unit-of-work';
import { IPollCommandRepo } from '../../ports/repos/command/i-poll-command-repo';
import { IUserVoteOptionCommandRepo } from '../../ports/repos/command/i-user-vote-option-command-repo';
import { PollEntity, PollProps } from '../entities/poll/poll-entity';
import { UserVoteOptionEntity } from '../entities/user-vote-option-entity';

export const createPollCommandService = (
  uow: IUnitOfWork,
  pollCommandRepo: IPollCommandRepo,
  userVoteOptionCommandRepo: IUserVoteOptionCommandRepo,
) => {
  const createPoll = async (dto: CreatePollDto): Promise<PollProps> => {
    return await uow.doWork(
      async () => {
        return await pollCommandRepo.create(
          PollEntity.create({
            ...dto,
          }),
        );
      },
      {
        transactionOptions: { useTransaction: true, isolationLevel: 'ReadCommitted' },
        useOptimisticLock: false,
      },
    );
  };

  const updatePoll = async (dto: UpdatePollDto): Promise<void> => {
    return await uow.doWork(
      async () => {
        const { pollId, ...data } = dto;
        const foundPoll = await pollCommandRepo.findById(pollId, 'exclusive');
        if (!foundPoll) {
          throw new Error();
        }
        await pollCommandRepo.update(PollEntity.update(foundPoll, { ...data }));
      },
      {
        transactionOptions: { useTransaction: true, isolationLevel: 'ReadCommitted' },
        useOptimisticLock: true,
      },
    );
  };

  const deletePoll = async (dto: DeletePollDto): Promise<void> => {
    return await uow.doWork(
      async () => {
        const { pollId } = dto;
        await pollCommandRepo.deletePoll(pollId);
      },
      { transactionOptions: { useTransaction: false }, useOptimisticLock: false },
    );
  };

  const vote = async (dto: voteDto): Promise<void> => {
    return await uow.doWork(
      async () => {
        const { optionId, userId } = dto;
        await userVoteOptionCommandRepo.vote(UserVoteOptionEntity.create({ optionId, userId }));
      },
      { transactionOptions: { useTransaction: false }, useOptimisticLock: true },
    );
  };

  const cancle = async (dto: voteDto): Promise<void> => {
    return await uow.doWork(
      async () => {
        const { optionId, userId } = dto;
        await userVoteOptionCommandRepo.cancle(optionId, userId);
      },
      { transactionOptions: { useTransaction: false }, useOptimisticLock: false },
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
