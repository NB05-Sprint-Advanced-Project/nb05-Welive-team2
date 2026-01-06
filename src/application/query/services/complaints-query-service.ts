import { ComplaintStatus, ComplaintsView } from '../views/complaints-veiw';

export const createComplaintsQueryService = (repo: IComplaintsQueryRepo) => {
  const getComplaint = async (complaintId: string): Promise<ComplaintsView> => {
    const complaint = await repo.findById(complaintId);

    if (!complaint) {
      throw new Error();
    }

    return complaint;
  };

  const getAllComplaints = async (
    page: number,
    limit: number,
    searchKeyword: string,
    status: ComplaintStatus | null,
  ): Promise<ComplaintsView[]> => {
    const complaints = await repo.findAll(page, limit, searchKeyword, status);
    return complaints;
  };

  return { getComplaint, getAllComplaints };
};
