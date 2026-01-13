import {
  CreatePollDto,
  DeletePollDto,
  UpdatePollDto,
  voteDto,
} from '../../../inbound/requests/poll-request';
import { IPollCommandRepo } from '../../ports/repos/command/i-poll-command-repo';
import { IUserVoteOptionCommandRepo } from '../../ports/repos/command/i-user-vote-option-command-repo';
import { PollEntity, PollProps } from '../entities/poll/poll-entity';
import { UserVoteOptionEntity } from '../entities/user-vote-option-entity';

export const createPollCommandService = (
  pollCommandRepo: IPollCommandRepo,
  userVoteCoptionCommandRepo: IUserVoteOptionCommandRepo,
) => {
  const createPoll = async (dto: CreatePollDto): Promise<PollProps> => {
    const { title, content, startDate, endDate, apartmentId, building, options } = dto;

    return await pollCommandRepo.create(
      PollEntity.create({
        title,
        content,
        startDate,
        endDate,
        apartmentId,
        building,
        options,
      }),
    );
  };

  const updatePoll = async (dto: UpdatePollDto): Promise<void> => {
    const { title, content, startDate, endDate, building, options, pollId } = dto;
    const foundPoll = await pollCommandRepo.findById(pollId);
    if (!foundPoll) {
      throw new Error();
    }
    await pollCommandRepo.update(
      PollEntity.update(foundPoll, { title, content, startDate, endDate, building, options }),
    );
  };

  const deletePoll = async (dto: DeletePollDto): Promise<void> => {
    const { pollId } = dto;
    await pollCommandRepo.deletePoll(pollId);
  };

  // 여기
  const vote = async (dto: voteDto): Promise<void> => {
    const { pollId, optionId, userId } = dto;
    await userVoteCoptionCommandRepo.vote(UserVoteOptionEntity.create({ optionId, userId }));
  };

  const cancle = async (dto: voteDto): Promise<void> => {
    const { pollId, optionId, userId } = dto;
    await userVoteCoptionCommandRepo.cancle(optionId, userId);
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
