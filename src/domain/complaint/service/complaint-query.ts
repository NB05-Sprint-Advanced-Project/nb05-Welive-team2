import { PageView } from '../../../shared/interface/i-page-view';
import { ComplaintListFilter, IComplaintQueryRepo } from '../interface/i-complaint-query-repo';
import { ComplaintView } from '../dto/complaint-veiw';
import { isTechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { IRedisExternal } from '../../../shared/interface/i-redis';
import { randomUUID } from 'crypto';

export const createComplaintQueryService = (
  redisExternal: IRedisExternal,
  complaintRepo: IComplaintQueryRepo,
) => {
  const getComplaint = async (complaintId: string): Promise<ComplaintView> => {
    try {
      let complaint;
      const key = `complaint:${complaintId}`;
      const cachedComplaint = await redisExternal.get(key);

      if (cachedComplaint) {
        complaint = JSON.parse(cachedComplaint);
      } else {
        for (let i = 0; i < 10; i++) {
          const locktoken = randomUUID();
          const isLocked = await redisExternal.setIfNotExist(
            `lock:complaint:${complaintId}`,
            locktoken,
            3,
          );
          if (isLocked) {
            try {
              const foundComplaint = await complaintRepo.findById(complaintId);
              await redisExternal.setIfNotExist(key, JSON.stringify(foundComplaint), 3);
              complaint = foundComplaint;
            } finally {
              await redisExternal.delifmatch(`lock:complaint:${complaintId}`, locktoken);
            }
            break;
          } else {
            await new Promise((resolve, reject) =>
              setTimeout(() => {
                resolve(0);
              }, 100),
            );

            const cachedComplaint = await redisExternal.get(key);
            if (cachedComplaint) {
              complaint = JSON.parse(cachedComplaint);
              break;
            }
          }
        }
      }

      if (!complaint) {
        const foundComplaint = await complaintRepo.findById(complaintId);
        await redisExternal.setIfNotExist(key, JSON.stringify(foundComplaint), 3);
        complaint = foundComplaint;
      }
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
      const { page, limit, ...filter } = params;
      const complaints = await complaintRepo.findAll(userId, page, limit, filter);

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
