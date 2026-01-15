import { PollProps } from '../../../command/entities/poll/poll-entity';

export interface IPollCommandRepo {
  findById(pollId: string, pessimisticLock?: 'share' | 'exclusive'): Promise<PollProps | null>;
  create(props: PollProps, pessimisticLock?: 'share' | 'exclusive'): Promise<PollProps>;
  update(props: PollProps, pessimisticLock?: 'share' | 'exclusive'): Promise<void>;
  deletePoll(pollId: string, pessimisticLock?: 'share' | 'exclusive'): Promise<void>;
}
