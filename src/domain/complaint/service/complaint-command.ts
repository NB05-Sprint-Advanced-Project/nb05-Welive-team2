import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { isTechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { IUnitOfWork } from '../../../shared/interface/i-unit-of-work';
import { ComplaintEntity, ComplaintStatus } from '../complaint-entity';
import { IComplaintCommandRepo } from '../interface/i-complaint-command-repo';

export const createComplaintCommandService = (
  uow: IUnitOfWork,
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
            type: BusinessExceptionType.REQ_INFO_INVALID_PLEASE_RETRY,
          });
        }
      }
    }
  };

  const updateComplaint = async (
    complaintId: string,
    complaint: { title: string; content: string; isPublic: boolean },
  ) => {
    try {
      const beforeContext = await complaintRepo.findById(complaintId);

      if (!beforeContext) {
        throw null;
      }

      const entity = ComplaintEntity.update(beforeContext, complaint);
      await complaintRepo.update(entity);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.RECORD_NOT_FOUND) {
          throw BusinessException({
            type: BusinessExceptionType.REQ_INFO_INVALID_PLEASE_RETRY,
          });
        }
      }
    }
  };

  const deleteComplaint = async (complaintId: string) => {
    try {
      await complaintRepo.delete(complaintId);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.RECORD_NOT_FOUND) {
          throw BusinessException({
            type: BusinessExceptionType.DELETED,
          });
        }
      }
    }
  };

  const updateComplaintStatus = async (complaintId: string, status: ComplaintStatus) => {
    try {
      const beforeContext = await complaintRepo.findById(complaintId);

      if (!beforeContext) {
        throw null;
      }

      const entity = ComplaintEntity.updateStatus(beforeContext, { status });
      await complaintRepo.updateStatus(entity);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.RECORD_NOT_FOUND) {
          throw BusinessException({
            type: BusinessExceptionType.REQ_INFO_INVALID_PLEASE_RETRY,
          });
        }
      }
    }
  };

  return { createComplaint, updateComplaint, deleteComplaint, updateComplaintStatus };
};

export type ComplaintCommandService = ReturnType<typeof createComplaintCommandService>;
