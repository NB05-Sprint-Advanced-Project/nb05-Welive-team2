import { UserVoteOptionProps } from './user-vote-option-entity';

export interface IUserVoteOptionCommandRepo {
  vote(props: UserVoteOptionProps): Promise<void>;
  cancle(optionId: string, userId: string): Promise<void>;
}
