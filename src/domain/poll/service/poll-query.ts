import { PollStatus } from '@prisma/client';
import { PollsView, PollView } from '../dto/poll-view';
import { IPollQueryRepo } from '../interface/i-poll-query-repo';
import { literal } from 'zod';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';

export const createPollQueryService = (repo: IPollQueryRepo) => {
  const getPoll = async (pollId: string, userId: string): Promise<PollView> => {
    const poll = await repo.findById(pollId, userId);

    if (!poll) {
      throw BusinessException({
        type: BusinessExceptionType.POLL_NOT_FOUND,
      });
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
    status: PollStatus | 'ALL';
    building: number;
  }): Promise<PollsView> => {
    const polls = await repo.findAll(page, limit, searchKeyword, status, building);

    return polls;
  };
  return { getPoll, getAllPolls };
};

export type PollQueryService = ReturnType<typeof createPollQueryService>;
