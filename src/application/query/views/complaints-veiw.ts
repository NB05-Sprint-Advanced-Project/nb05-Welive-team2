export type ComplaintStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

export interface ComplaintsView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  status: ComplaintStatus;
  isPublic: boolean;
  viewsCount: number;
  apartmentId: string;

  complaint: {
    id: string;
    name: string;
  };

  commentCount: number;
}
