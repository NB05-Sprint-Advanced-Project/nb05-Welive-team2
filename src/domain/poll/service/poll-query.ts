import { PollStatus } from '@prisma/client';
import { PollsView, PollView } from '../dto/poll-view';
import { IPollQueryRepo } from '../interface/i-poll-query-repo';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { IRedisExternal } from '../../../shared/interface/i-redis';
import { IRedisLocker } from '../../../shared/interface/i-redis-locker';

export const createPollQueryService = (
  repo: IPollQueryRepo,
  redisExternal: IRedisExternal,
  redisLocker: IRedisLocker,
) => {
  const getPoll = async (pollId: string, userId: string): Promise<PollView> => {
    const poll = await redisLocker.doWork({
      key: `pollId:${pollId}`,
      lockKey: `lock:poll:${pollId}`,
      work: async () => {
        const found = await repo.findById(pollId, userId);
        if (!found) {
          throw BusinessException({ type: BusinessExceptionType.NOTICE_NOT_FOUND });
        }
        return found;
      },
      cacheTtlSeconds: 60,
    });

    if (!poll) {
      throw BusinessException({ type: BusinessExceptionType.NOTICE_NOT_FOUND });
    }
    return poll;
  };

  // 대부분의 사용자가 1페이지/전체 카테고리만 조회. 따라서 이것만 캐싱
  const getAllPolls = async (
    userId: string,
    {
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
    },
  ): Promise<PollsView> => {
    const isDefaultReq =
      page === 1 && limit === 10 && searchKeyword === '' && status === 'ALL' && building === 0;
    const key = `polls:list:default`;

    if (isDefaultReq) {
      const cached = await redisExternal.get(key);
      if (cached) return JSON.parse(cached);
    }
    const polls = await repo.findAll(page, limit, searchKeyword, status, building, userId);

    if (isDefaultReq) {
      await redisExternal.setIfNotExist(key, JSON.stringify(polls), 3);
    }
    return polls;
  };
  return { getPoll, getAllPolls };
};

export type PollQueryService = ReturnType<typeof createPollQueryService>;
