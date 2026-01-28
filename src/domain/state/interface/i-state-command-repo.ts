import { NotificationStateProps, StateProps, StatusType } from '../entity/state';

export interface IStateCommandRepo {
  create(entity: StateProps): Promise<void>;
  findAllByStatus(status: StatusType): Promise<StateProps[]>;
  bulkUpdate(ids: string[]): Promise<void>;
}
