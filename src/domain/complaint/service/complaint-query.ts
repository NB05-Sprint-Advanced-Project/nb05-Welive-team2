import { PageView } from '../../../shared/interface/i-page-view';
import { ComplaintListFilter, IComplaintQueryRepo } from '../interface/i-complaint-query-repo';
import { ComplaintView } from '../dto/complaint-veiw';
import { isTechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';

export const createComplaintQueryService = (compliantRepo: IComplaintQueryRepo) => {
  const getComplaint = async (complaintId: string): Promise<ComplaintView> => {
    try {
      const complaint = await compliantRepo.findById(complaintId);

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
    apartmentId: number,
    params: ComplaintListFilter & { page: number; limit: number },
  ): Promise<PageView<ComplaintView>> => {
    try {
      const { page, limit, ...filter } = params;
      const complaints = await compliantRepo.findAll(apartmentId, page, limit, filter);

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
