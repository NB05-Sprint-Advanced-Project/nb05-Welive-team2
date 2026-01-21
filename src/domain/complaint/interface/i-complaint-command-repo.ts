import { ComplaintProps } from '../complaint-entity';

export interface IComplaintCommandRepo {
  findById(complaintId: string): Promise<ComplaintProps | null>;
  create(entity: ComplaintProps): Promise<ComplaintProps>;
  update(entity: ComplaintProps): Promise<void>;
  delete(complaintId: string): Promise<void>;
  updateStatus(entity: ComplaintProps): Promise<void>;
  updateViewCountBulk(props: { complaintId: string; viewCount: number }[]): Promise<void>;
}
