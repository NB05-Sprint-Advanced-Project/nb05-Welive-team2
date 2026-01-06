import { IComplaintQueryRepo } from '../../ports/repos/query/i-complaint-query-repo';
import { ComplaintStatus, ComplaintView } from '../views/complaint-veiw';

export const createComplaintQueryService = (repo: IComplaintQueryRepo) => {
  const getComplaint = async (complaintId: string): Promise<ComplaintView> => {
    const complaint = await repo.findId(complaintId);

    if (!complaint) {
      throw new Error();
    }

    return complaint;
  };

  const getAllComplaints = async (
    page: number,
    limit: number,
    searchKeyword: string,
    status: string,
    isPublic: boolean,
    building: number,
    unit: number,
  ): Promise<ComplaintView[]> => {
    const complaints = await repo.findAll(
      page,
      limit,
      searchKeyword,
      status,
      isPublic,
      building,
      unit,
    );
    return complaints;
  };

  return { getComplaint, getAllComplaints };
};
