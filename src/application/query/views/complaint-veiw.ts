export type ComplaintStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

export interface ComplaintView {
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
