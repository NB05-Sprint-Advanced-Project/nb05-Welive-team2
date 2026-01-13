import { PageView } from '../../../../shared/types/page-view';
import { ComplaintStatus, ComplaintView } from '../../../query/views/complaint-veiw';

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
    apartmentId: number,
    page: number,
    limit: number,
    filter: ComplaintListFilter,
  ): Promise<PageView<ComplaintView>>;
}
