import { UserVoteOptionProps } from './user-vote-option-entity';
import { IUserVoteOptionCommandRepo } from './i-user-vote-option-command-repo';
import { BasePrismaClient } from '../../shared/base-command-repo';

export const createUserVoteOptionCommandRepo = (
  prismaClient: BasePrismaClient,
): IUserVoteOptionCommandRepo => {
  const vote = async (props: UserVoteOptionProps): Promise<void> => {
    await prismaClient.userVoteOption.create({
      data: {
        ...props,
      },
    });
  };

  const cancle = async (optionId: string, userId: string): Promise<void> => {
    await prismaClient.userVoteOption.delete({
      where: {
        userId_optionId: { userId, optionId },
      },
    });
  };

  return { vote, cancle };
};
