import { ComplaintStatus, ComplaintView } from '../../../query/views/complaint-veiw';

export interface IComplaintQueryRepo {
  findById(complaintId: string): Promise<ComplaintView>;
  findAll(
    page: number,
    limit: number,
    searchKeyword: string,
    status: ComplaintStatus,
    isPublic: boolean,
    building: number,
    unit: number,
  ): Promise<ComplaintView[]>;
}
