import { PollStatus, PrismaClient } from '@prisma/client';
import { IPollQueryRepo } from '../interface/i-poll-query-repo';
import { PollsView, PollView } from '../dto/poll-view';

export const createPollQueryRepo = (prismaClient: PrismaClient): IPollQueryRepo => {
  const findById = async (pollId: string, userId: string): Promise<PollView | null> => {
    const poll = await prismaClient.polls.findUnique({
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
        author: true,
      },
    });
    if (!poll) {
      return null;
    }

    let optionIdVotedByMe: string | null = null;

    for (const option of poll.options) {
      if (option.UserVoteOptions.includes({ userId })) {
        optionIdVotedByMe = option.id;
        break;
      }
    }
    return {
      id: poll.id,
      createdAt: poll.createdAt,
      title: poll.title,
      content: poll.content,
      status: poll.status,
      startDate: poll.startDate,
      endDate: poll.endDate,
      apartmentId: poll.apartmentId,
      building: poll.building,
      author: {
        id: poll.author.id,
        name: poll.author.name,
      },
      options: poll.options.map((opt) => {
        return {
          id: opt.id,
          title: opt.title,
          voteCount: opt.UserVoteOptions.length,
        };
      }),
      optionIdVotedByMe: optionIdVotedByMe,
    };
  };

  const findAll = async (
    page: number,
    limit: number,
    searchKeyword: string,
    status: PollStatus | 'ALL',
    building: number,
  ): Promise<PollsView> => {
    
    const where = {
      status: status === 'ALL' ? undefined : status,
      building: building === 0 ? undefined : building,
      ...(searchKeyword
        ? {
            OR: [
              { title: { contains: searchKeyword } },
              { content: { contains: searchKeyword } },
              { author: { name: { contains: searchKeyword } } },
            ],
          }
        : {}),
    };
    const [polls, totalCount] = await Promise.all([
      prismaClient.polls.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          title: true,
          content: true,
          status: true,
          startDate: true,
          endDate: true,
          apartmentId: true,
          building: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prismaClient.polls.count({ where }),
    ]);
    const hasNext = page * limit < totalCount;

    return { data: polls, totalCount, page, limit, hasNext };
  };

  return { findById, findAll };
};

export type PollQueryRepo = ReturnType<typeof createPollQueryRepo>;
