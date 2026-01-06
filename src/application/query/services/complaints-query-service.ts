import { IComplaintsQueryRepo } from '../../ports/repos/query/i-complaints-query-repo';
import { ComplaintStatus, ComplaintsView } from '../views/complaints-veiw';

export const createComplaintsQueryService = (repo: IComplaintsQueryRepo) => {
  const getComplaint = async (complaintId: string): Promise<ComplaintsView> => {
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
  ): Promise<ComplaintsView[]> => {
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
