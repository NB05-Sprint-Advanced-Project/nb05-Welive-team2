import { PollStatus } from '@prisma/client';
import { PollView } from '../views/poll-view';
import { IPollQueryRepo } from '../../ports/repos/query/i-poll-query-repo';

export const createPollQueryService = (repo: IPollQueryRepo) => {
  const getPoll = async (pollId: string): Promise<PollView> => {
    const poll = await repo.findById(pollId);

    if (!poll) {
      throw new Error();
    }
    return poll;
  };

  const getAllPolls = async ({
    page,
    limit,
    searchKeyword,
    status,
    building,
  }: {
    page: number;
    limit: number;
    searchKeyword: string;
    status: PollStatus;
    building: number;
  }): Promise<PollsView> => {
    const polls = await repo.findAll(page, limit, searchKeyword, status, building);

    return polls;
  };
  return { getPoll, getAllPolls };
};

export type PollQueryService = ReturnType<typeof createPollQueryService>;
