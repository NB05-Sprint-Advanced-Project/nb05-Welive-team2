import { PageView } from '../../../shared/interface/i-page-view';
import { ComplaintListFilter, IComplaintQueryRepo } from '../interface/i-complaint-query-repo';
import { ComplaintView } from '../dto/complaint-veiw';

export const createComplaintQueryService = (compliantRepo: IComplaintQueryRepo) => {
  const getComplaint = async (complaintId: string): Promise<ComplaintView> => {
    const complaint = await compliantRepo.findById(complaintId);

    if (!complaint) {
      throw null;
    }

    return complaint;
  };

  const getAllComplaints = async (
    apartmentId: number,
    params: ComplaintListFilter & { page: number; limit: number },
  ): Promise<PageView<ComplaintView>> => {
    const { page, limit, ...filter } = params;
    const complaints = await compliantRepo.findAll(apartmentId, page, limit, filter);

    if (!complaints) {
      throw null;
    }
    return complaints;
  };

  return { getComplaint, getAllComplaints };
};

export type ComplaintQueryService = ReturnType<typeof createComplaintQueryService>;
