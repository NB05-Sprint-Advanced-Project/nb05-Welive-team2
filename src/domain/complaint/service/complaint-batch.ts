import { IRedisExternal } from '../../../shared/interface/i-redis';
import { IComplaintCommandRepo } from '../interface/i-complaint-command-repo';

export const createComplaintBatchService = (
  redisExternal: IRedisExternal,
  complaintRepo: IComplaintCommandRepo,
) => {
  const syncViewCounts = async () => {
    const key = `dirty:complaintIds`;

    while (true) {
      const dirtyComplaintIds = await redisExternal.popFromSet(key, 50);
      if (dirtyComplaintIds.length === 0) {
        break;
      }

      const viewCounts = await redisExternal.getMany(
        dirtyComplaintIds.map((complaintId) => `complaint:${complaintId}:viewCount`),
      );

      await complaintRepo.updateViewCountBulk(
        dirtyComplaintIds.map((complaintId, index) => {
          return {
            complaintId,
            viewsCount: viewCounts[index] === null ? 0 : Number(viewCounts[index]),
          };
        }),
      );
    }
  };
  return { syncViewCounts };
};

export type ComplaintBatchService = ReturnType<typeof createComplaintBatchService>;
