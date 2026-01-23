import { IRedisExternal } from '../../../shared/interface/i-redis';
import { INoticeCommandRepo } from '../interface/i-notice-command-repo';

export const createNoticeBatchService = (
  repo: INoticeCommandRepo,
  redisExternal: IRedisExternal,
) => {
  const syncViewCounts = async () => {
    const dirtyKey = `dirty:noticeIds`;

    while (true) {
      const noticeIds = await redisExternal.popFromSet(dirtyKey, 100);
      if (!noticeIds || noticeIds.length === 0) return;

      const viewCounts = await redisExternal.getMany(
        noticeIds.map((id) => `notice:${id}:viewCount`),
      );

      await repo.updateViewCountBulk(
        noticeIds.map((noticeId, index) => {
          return {
            noticeId,
            viewCount: viewCounts[index] === null ? 0 : Number(viewCounts[index]),
          };
        }),
      );
    }
  };
  return { syncViewCounts };
};

export type NoticeBatchService = ReturnType<typeof createNoticeBatchService>;
