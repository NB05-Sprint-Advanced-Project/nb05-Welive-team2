import { ComplaintProps } from '../../../command/entities/complaint-entity';

export interface IComplaintCommandRepo {
  findById(complaintId: string): Promise<ComplaintProps>;
  create(entity: ComplaintProps): Promise<ComplaintProps>;
  update(entity: ComplaintProps): Promise<void>;
  remove(complaintId: string): Promise<void>;
  updateStatus(entity: ComplaintProps): Promise<void>;
}
