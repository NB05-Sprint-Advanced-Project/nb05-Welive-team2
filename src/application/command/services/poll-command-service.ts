import {
  CreatePollDto,
  DeletePollDto,
  UpdatePollDto,
  voteDto,
} from '../../../inbound/requests/poll-request';
import { IPollCommandRepo } from '../../ports/repos/command/i-poll-command-repo';
import { PollEntity, PollProps } from '../entities/poll/poll-entity';

export const createPollCommandService = (repo: IPollCommandRepo) => {
  const createPoll = async (dto: CreatePollDto): Promise<PollProps> => {
    const { title, content, startDate, endDate, apartmentId, building, options } = dto;

    return await repo.create(
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
    const foundPoll = await repo.findById(pollId);
    if (!foundPoll) {
      throw new Error();
    }
    await repo.update(
      PollEntity.update(foundPoll, { title, content, startDate, endDate, building, options }),
    );
  };

  const deletePoll = async (dto: DeletePollDto): Promise<void> => {
    const { pollId } = dto;
    await repo.deletePoll(pollId);
  };

  const vote = async (dto: voteDto) => {
    // 로그인 된 후에 구현하겠습니다...ㅠ
  };
  return {
    createPoll,
    updatePoll,
    deletePoll,
    vote,
  };
};

export type PollCommandService = ReturnType<typeof createPollCommandService>;
