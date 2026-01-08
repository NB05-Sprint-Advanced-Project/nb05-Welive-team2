import {
  CreatePollDto,
  DeletePollDto,
  UpdatePollDto,
} from '../../../inbound/requests/poll-request';
import { IPollCommandRepo } from '../../ports/repos/command/i-poll-command-repo';
import { PollEntity, PollModel } from '../entities/poll/poll-entity';

export const createPollCommandService = (repo: IPollCommandRepo) => {
  const createPoll = async (dto: CreatePollDto): Promise<PollModel> => {
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
    await repo.update(
      PollEntity.update(foundPoll, { title, content, startDate, endDate, building, options }),
    );
  };

  const deletePoll = async (dto: DeletePollDto): Promise<void> => {
    const { pollId } = dto;
    await repo.delete(pollId);
  };

  return {
    createPoll,
    updatePoll,
    deletePoll,
  };
};
