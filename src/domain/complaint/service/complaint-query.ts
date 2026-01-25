import { PageView } from '../../../shared/interface/i-page-view';
import { ComplaintListFilter, IComplaintQueryRepo } from '../interface/i-complaint-query-repo';
import { ComplaintView } from '../dto/complaint-veiw';
import { isTechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { randomUUID } from 'crypto';
import { redisKeys } from '../../../utils/redis-keys';
import { IRedisLocker } from '../../../shared/interface/i-redis-locker';
import { IRedisExternal } from '../../../shared/interface/i-redis';

export const createComplaintQueryService = (
  redisLocker: IRedisLocker,
  redisExternal: IRedisExternal,
  complaintRepo: IComplaintQueryRepo,
) => {
  const getComplaint = async (complaintId: string): Promise<ComplaintView> => {
    try {
      const { key, lock } = redisKeys.complaintById(complaintId);

      const complaint = await redisLocker.doWork({
        key,
        lockKey: lock,
        work: () => complaintRepo.findById(complaintId),
        cacheTtlSeconds: 60,
      });

      if (!complaint) {
        throw BusinessException({
          type: BusinessExceptionType.COMPLAINT_NOT_FOUND,
        });
      }

      const viewCountKey = `complaint:${complaintId}:viewCount`;
      await redisExternal.setIfNotExist(viewCountKey, String(complaint.viewsCount), 3600 * 24);
      const newViewCount = await redisExternal.increase(viewCountKey);

      const dirtyComplaintKey = 'dirty:complaintIds';
      await redisExternal.addToSet(dirtyComplaintKey, complaintId);

      complaint.viewsCount = newViewCount;
      return complaint;
    } catch (err) {
      if (isTechnicalException(err)) {
        if (
          [
            TechnicalExceptionType.RECORD_NOT_FOUND,
            TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
          ].includes(err.type)
        ) {
          throw BusinessException({
            type: BusinessExceptionType.COMPLAINT_NOT_FOUND,
          });
        }
      }
      throw err;
    }
  };

  const getAllComplaints = async (
    userId: string,
    params: ComplaintListFilter & { page: number; limit: number },
  ): Promise<PageView<ComplaintView>> => {
    try {
      const { page, limit, status, isPublic, building, unit, searchKeyword } = params;

      const hasExtaFilters = searchKeyword || building !== undefined || unit !== undefined;

      if (hasExtaFilters) {
        return await complaintRepo.findAll(userId, page, limit, { searchKeyword, building, unit });
      }

      const { key, lock } = redisKeys.complaintsList({ userId, page, limit, status, isPublic });

      const complaints = await redisLocker.doWork({
        key,
        lockKey: lock,
        work: () => complaintRepo.findAll(userId, page, limit, { status, isPublic }),
      });

      if (!complaints) {
        return complaintRepo.findAll(userId, page, limit, { status, isPublic });
      }

      return complaints;
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.FOREIGN_KEY_VIOLATION) {
          throw BusinessException({
            type: BusinessExceptionType.COMPLAINTS_LIST_NOT_FOUND,
          });
        }
      }
      throw err;
    }
  };

  return { getComplaint, getAllComplaints };
};

export type ComplaintQueryService = ReturnType<typeof createComplaintQueryService>;
