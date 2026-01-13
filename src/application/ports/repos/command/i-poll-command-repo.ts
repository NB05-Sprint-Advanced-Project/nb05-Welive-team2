import { PollProps } from '../../../command/entities/poll/poll-entity';

export interface IPollCommandRepo {
  findById(pollId: string): Promise<PollProps | null>;
  create(props: PollProps): Promise<PollProps>;
  update(props: PollProps): Promise<void>;
  deletePoll(pollId: string): Promise<void>;
}
