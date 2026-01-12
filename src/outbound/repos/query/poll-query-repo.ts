import { PollStatus, PrismaClient } from '@prisma/client';
import { IPollQueryRepo } from '../../../application/ports/repos/query/i-poll-query-repo';
import { PollView } from '../../../application/query/views/poll-view';

export const createPollQueryRepo = (prismaClient: PrismaClient): IPollQueryRepo => {
  const findById = async (pollId: string): Promise<PollView | null> => {
    const poll = await prismaClient.polls.findUnique({
      where: { id: pollId },
      include: {
        options: true,
        userId: true,
      },
    });
    if (!poll) {
      return null;
    }

    return {
      id: poll.id,
      createdAt: poll.createdAt,
      title: poll.title,
      content: poll.content,
      status: poll.status,
      starDate: poll.startDate,
      endDate: poll.endDate,
      apartmentId: poll.apartmentId,
      building: poll.building,
      options: poll.options,
    };
  };

  const findAll = (
    page: number,
    limit: number,
    searchKeyword: string,
    status: PollStatus,
    building: number,
  ): Promise<PollView[]> => {};
  return { findById, findAll };
};
