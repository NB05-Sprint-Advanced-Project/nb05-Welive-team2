import { IRedisExternal } from '../../../shared/interface/i-redis';
import { INoticeCommandRepo } from '../interface/i-notice-command-repo';

export const createNoticeBatchService = (
  repo: INoticeCommandRepo,
  redisExternal: IRedisExternal,
) => {
  const syncViewsCounts = async () => {
    const dirtyKey = `dirty:noticeIds`;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const noticeIds = await redisExternal.popFromSet(dirtyKey, 100);
      if (!noticeIds || noticeIds.length === 0) return;

      const viewsCounts = await redisExternal.getMany(
        noticeIds.map((id) => `notice:${id}:viewsCount`),
      );

      await repo.updateViewsCountBulk(
        noticeIds.map((noticeId, index) => {
          return {
            noticeId,
            viewsCount: viewsCounts[index] === null ? 0 : Number(viewsCounts[index]),
          };
        }),
      );
    }
  };
  return { syncViewsCounts };
};

export type NoticeBatchService = ReturnType<typeof createNoticeBatchService>;
