import { PollProps } from '../../../command/entities/poll/poll-entity';

export interface IPollCommandRepo {
  findById(pollId: string): Promise<PollProps>;
  create(model: PollProps): Promise<PollProps>;
  update(model: PollProps): Promise<void>;
  delete(pollId: string): Promise<void>;
}
