import { PollProps } from '../entity/poll';

export interface IPollCommandRepo {
  findById(pollId: string, pessimisticLock?: 'share' | 'exclusive'): Promise<PollProps | null>;
  create(props: PollProps, pessimisticLock?: 'share' | 'exclusive'): Promise<PollProps>;
  update(props: PollProps, pessimisticLock?: 'share' | 'exclusive'): Promise<void>;
  deletePoll(pollId: string, pessimisticLock?: 'share' | 'exclusive'): Promise<void>;
}
