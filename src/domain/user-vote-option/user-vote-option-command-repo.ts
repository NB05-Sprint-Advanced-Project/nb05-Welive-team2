import { UserVoteOptionProps } from './user-vote-option-entity';
import { IUserVoteOptionCommandRepo } from './i-user-vote-option-command-repo';
import { BaseRepo } from '../../shared/base-command-repo';
import { PrismaClient } from '@prisma/client';

export const createUserVoteOptionCommandRepo = (
  prismaClient: PrismaClient,
): IUserVoteOptionCommandRepo => {
  const { prisma } = BaseRepo(prismaClient);
  const vote = async (props: UserVoteOptionProps): Promise<void> => {
    await prisma().userVoteOption.create({
      data: {
        ...props,
      },
    });
  };

  const cancle = async (optionId: string, userId: string): Promise<void> => {
    await prisma().userVoteOption.deleteMany({
      where: {
        userId,
        optionId,
      },
    });
  };

  return { vote, cancle };
};
