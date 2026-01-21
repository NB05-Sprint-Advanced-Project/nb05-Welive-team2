import { PageView } from '../../../shared/interface/i-page-view';
import { ComplaintStatus, ComplaintView } from '../dto/complaint-veiw';

export type ComplaintListFilter = {
  searchKeyword?: string;
  status?: ComplaintStatus;
  isPublic?: boolean;
  building?: number;
  unit?: number;
};

export interface IComplaintQueryRepo {
  findById(complaintId: string): Promise<ComplaintView>;
  findAll(
    apartmentId: string,
    page: number,
    limit: number,
    filter: ComplaintListFilter,
  ): Promise<PageView<ComplaintView>>;
}
