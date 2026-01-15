import { Prisma } from '@prisma/client';
import { PollProps } from '../entity/poll';
import { IPollCommandRepo } from '../interface/i-poll-command-repo';
import { asyncContextStorage } from '../../../utils/async-context-storage-util';
import { BasePrismaClient } from '../../../shared/base-command-repo';

export const createPollCommandRepo = (prismaClient: BasePrismaClient): IPollCommandRepo => {
  const getPrisma = () => asyncContextStorage.get() ?? prismaClient;

  const findById = async (
    pollId: string,
    pessimisticLock?: 'share' | 'exclusive',
  ): Promise<PollProps | null> => {
    const prisma = getPrisma();

    if (!pessimisticLock) {
      const poll = await prisma.polls.findUnique({
        where: { id: pollId },
        include: {
          options: {
            include: {
              UserVoteOptions: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });
      if (!poll) {
        return null;
      }

      return {
        ...poll,
        options: poll.options.map((opt) => {
          return {
            id: opt.id,
            title: opt.title,
            count: opt.UserVoteOptions.length,
          };
        }),
      };
    } else {
      const lockSql = pessimisticLock === 'share' ? Prisma.sql`FOR SHARE` : Prisma.sql`FOR UPDATE`;

      const polls = await prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT
          p.*,
          o.id as option_id,
          o.title as option_title,
          (SELECT COUNT(*) FROM "UserVoteOption" uvo WHERE uvo."optionId" = o.id)::int AS option_count
          FROM "Polls" p
          LEFT JOIN "Options" o ON o."pollId" = p.id
          WHERE p.id = ${pollId}
          ${lockSql}
        `);
      if (polls.length === 0) {
        return null;
      }
      const { option_id, option_title, option_count, ...data } = polls[0];
      return {
        ...data,
        options: polls
          .filter((poll) => poll.option_id)
          .map((opt) => {
            return {
              id: opt.opotion_id,
              title: opt.opotion_title,
              count: opt.opotion_count || 0,
            };
          }),
      };
    }
  };

  const create = async (props: PollProps): Promise<PollProps> => {
    const prisma = getPrisma();

    const { options, ...data } = props;
    const poll = await prisma.polls.create({
      data: {
        ...data,
        options: {
          create: options.map((opt) => {
            return { id: opt.id, title: opt.title };
          }),
        },
      },
      include: {
        options: {
          include: {
            UserVoteOptions: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    return {
      ...poll,
      options: poll.options.map((opt) => {
        return {
          id: opt.id,
          title: opt.title,
          count: 0,
        };
      }),
    };
  };

  const update = async (props: PollProps): Promise<void> => {
    const prisma = getPrisma();

    const { options, ...data } = props;
    await prisma.polls.update({
      where: { id: props.id },
      data: {
        ...data,
        options: {
          deleteMany: {},
          create: options.map((opt) => {
            return { id: opt.id, title: opt.title };
          }),
        },
      },
    });
    return;
  };

  const deletePoll = async (pollId: string): Promise<void> => {
    const prisma = getPrisma();

    await prisma.polls.delete({
      where: { id: pollId },
    });
    return;
  };

  return {
    findById,
    create,
    update,
    deletePoll,
  };
};

export type PollCommandRepo = ReturnType<typeof createPollCommandRepo>;
