import { Prisma, PrismaClient } from '@prisma/client';
import { PollProps } from '../entity/poll';
import { IPollCommandRepo } from '../interface/i-poll-command-repo';
import { BaseRepo } from '../../../shared/base-command-repo';
import { TechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';

export const createPollCommandRepo = (prismaClient: PrismaClient): IPollCommandRepo => {
  const { prisma } = BaseRepo(prismaClient);

  const findById = async (
    pollId: string,
    pessimisticLock?: 'share' | 'exclusive',
  ): Promise<PollProps | null> => {
    if (!pessimisticLock) {
      const poll = await prisma().polls.findUnique({
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
      const lockSql =
        pessimisticLock === 'share' ? Prisma.sql`FOR SHARE OF p` : Prisma.sql`FOR UPDATE OF p`;

      const polls = await prisma().$queryRaw<any[]>(Prisma.sql`
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
              id: opt.option_id,
              title: opt.option_title,
              count: opt.option_count || 0,
            };
          }),
      };
    }
  };

  const create = async (props: PollProps, userId: string): Promise<PollProps> => {
    try {
      const { options, ...data } = props;
      const poll = await prisma().polls.create({
        data: {
          ...data,
          userId,
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
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          const fieldName = (err.meta as any)?.field_name;
          const targetConstraints = [
            'Comment_userId_fkey',
            'Comment_noticeId_fkey',
            'Comment_complaintId_fkey',
          ];

          if (targetConstraints.some((c) => fieldName.include(c))) {
            throw TechnicalException({
              type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
              meta: err.meta,
            });
          }
        }
      }
      throw err;
    }
  };

  const update = async (props: PollProps): Promise<void> => {
    const { options, ...data } = props;
    try {
      await prisma().polls.update({
        where: { id: props.id, version: props.version },
        data: {
          ...data,
          version: { increment: 1 },
          options: {
            deleteMany: {},
            create: options.map((opt) => {
              return { id: opt.id, title: opt.title };
            }),
          },
        },
      });
      return;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw TechnicalException({
            type: TechnicalExceptionType.RECORD_NOT_FOUND,
            meta: err.meta,
          });
        }
      }
      throw err;
    }
  };

  const deletePoll = async (pollId: string): Promise<void> => {
    await prisma().polls.deleteMany({
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
