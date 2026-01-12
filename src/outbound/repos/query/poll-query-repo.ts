import { PollStatus, PrismaClient } from '@prisma/client';
import { IPollQueryRepo } from '../../../application/ports/repos/query/i-poll-query-repo';
import { PollsView, PollView } from '../../../application/query/views/poll-view';

export const createPollQueryRepo = (prismaClient: PrismaClient): IPollQueryRepo => {
  const findById = async (pollId: string, userId: string): Promise<PollView | null> => {
    const poll = await prismaClient.polls.findUnique({
      where: { id: pollId },
      include: {
        options: true,
        author: true,
      },
    });
    if (!poll) {
      return null;
    }

    let optionIdVotedByMe: string | null = null;

    for (const option of poll.options) {
      if (option.userIds.includes(userId)) {
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
          voteCount: opt.userIds.length,
        };
      }),
      optionIdVotedByMe: optionIdVotedByMe,
    };
  };

  const findAll = async (
    page: number,
    limit: number,
    searchKeyword: string,
    status: PollStatus,
    building: number,
  ): Promise<PollsView> => {
    const where = {
      building,
      status,
      title: { contains: searchKeyword },
    };
    const polls = await prismaClient.polls.findMany({
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
    });
    const totalCount = await prismaClient.polls.count({
      where,
    });

    const hasNext = page * limit < totalCount;

    return { data: polls, totalCount, page, limit, hasNext };
  };

  return { findById, findAll };
};

export type PollQueryRepo = ReturnType<typeof createPollQueryRepo>;
