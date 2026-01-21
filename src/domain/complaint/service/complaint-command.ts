import { dir } from 'console';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { isTechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { IRedisExternal } from '../../../shared/interface/i-redis';
import { IUnitOfWork } from '../../../shared/interface/i-unit-of-work';
import { ComplaintEntity, ComplaintStatus } from '../complaint-entity';
import { IComplaintCommandRepo } from '../interface/i-complaint-command-repo';
import { createComplaintCommandRepo } from '../repo/complaint-command';

export const createComplaintCommandService = (
  uow: IUnitOfWork,
  redisExternal: IRedisExternal,
  complaintRepo: IComplaintCommandRepo,
) => {
  const createComplaint = async (
    userId: string,
    args: { title: string; content: string; isPublic: boolean; apartmentId: string },
  ) => {
    try {
      const { title, content, isPublic, apartmentId } = args;

      const entity = ComplaintEntity.create({
        title,
        content,
        isPublic,
        apartmentId,
        userId: userId,
      });

      return await complaintRepo.create(entity);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.FOREIGN_KEY_VIOLATION) {
          throw BusinessException({
            type: BusinessExceptionType.FAIL_SAVE_COMPALINT,
          });
        }
      }
      throw err;
    }
  };

  const updateComplaint = async (
    userId: string,
    complaintId: string,
    complaint: { title: string; content: string; isPublic: boolean },
  ) => {
    try {
      await uow.doWork(
        async () => {
          const beforeContext = await complaintRepo.findById(complaintId);

          if (!beforeContext) {
            throw BusinessException({
              type: BusinessExceptionType.REQ_INFO_INVALID,
            });
          }
          if (beforeContext.userId !== userId) {
            throw BusinessException({
              type: BusinessExceptionType.FORBIDDEN,
            });
          }
          if (beforeContext.status !== 'PENDING') {
            throw BusinessException({
              type: BusinessExceptionType.DONT_MODIFY_COMPLAINT,
            });
          }

          const entity = ComplaintEntity.update(beforeContext, complaint);
          await complaintRepo.update(entity);

          await redisExternal.del(`complaint:${complaintId}`);
        },
        {
          transactionOptions: { useTransaction: false },
          useOptimisticLock: true,
        },
      );
    } catch (err) {
      if (isTechnicalException(err)) {
        if (
          [
            TechnicalExceptionType.RECORD_NOT_FOUND,
            TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
          ].includes(err.type)
        ) {
          throw BusinessException({
            type: BusinessExceptionType.FAIL_SAVE_COMPALINT,
          });
        }
      }
      throw err;
    }
  };

  const deleteComplaint = async (userId: string, complaintId: string) => {
    try {
      const beforeContext = await complaintRepo.findById(complaintId);

      if (!beforeContext) {
        throw BusinessException({
          type: BusinessExceptionType.REQ_INFO_INVALID,
        });
      }
      if (beforeContext.userId !== userId) {
        throw BusinessException({
          type: BusinessExceptionType.FORBIDDEN,
        });
      }

      await complaintRepo.delete(complaintId);
      await redisExternal.del(`complaint:${complaintId}`);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.RECORD_NOT_FOUND) {
          throw BusinessException({
            type: BusinessExceptionType.DELETED,
          });
        }
      }
      throw err;
    }
  };

  const updateComplaintStatus = async (
    requesterRole: string,
    complaintId: string,
    status: ComplaintStatus,
  ) => {
    try {
      await uow.doWork(async () => {
        if (requesterRole !== 'ADMIN') {
          throw BusinessException({
            type: BusinessExceptionType.FORBIDDEN,
          });
        }

        const beforeContext = await complaintRepo.findById(complaintId);

        if (!beforeContext) {
          throw BusinessException({
            type: BusinessExceptionType.REQ_INFO_INVALID,
          });
        }

        if (beforeContext.status === 'IN_PROGRESS' && status === 'PENDING') {
          throw BusinessException({
            type: BusinessExceptionType.DONT_MODIFY_PENDING,
          });
        }
        if (beforeContext.status === 'RESOLVED' && status !== 'RESOLVED') {
          throw BusinessException({
            type: BusinessExceptionType.DONT_MODIFY_RESOLVED,
          });
        }
        if (beforeContext.status === 'REJECTED' && status !== 'REJECTED') {
          if (['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
            throw BusinessException({
              type: BusinessExceptionType.DONT_MODIFY_REJECTED,
            });
          }

          const entity = ComplaintEntity.updateStatus(beforeContext, { status });
          await complaintRepo.updateStatus(entity);
          await redisExternal.del(`complaint:${complaintId}`);
        }
      });
    } catch (err) {
      if (isTechnicalException(err)) {
        if (
          [
            TechnicalExceptionType.RECORD_NOT_FOUND,
            TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
          ].includes(err.type)
        ) {
          throw BusinessException({
            type: BusinessExceptionType.FAIL_SAVE_COMPALINT,
          });
        }
      }
      throw err;
    }
  };

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
            viewCount: viewCounts[index] === null ? 0 : Number(viewCounts[index]),
          };
        }),
      );
    }
  };

  return {
    createComplaint,
    updateComplaint,
    deleteComplaint,
    updateComplaintStatus,
    syncViewCounts,
  };
};

export type ComplaintCommandService = ReturnType<typeof createComplaintCommandService>;
