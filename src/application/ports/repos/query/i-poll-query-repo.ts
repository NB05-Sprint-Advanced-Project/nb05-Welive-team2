import { PollStatus } from '@prisma/client';
import { PollsView, PollView } from '../../../query/views/poll-view';

export interface IPollQueryRepo {
  findById(pollId: string, userId: string): Promise<PollView | null>;
  findAll(
    page: number,
    limit: number,
    searchKeyword: string,
    status: PollStatus,
    building: number,
  ): Promise<PollsView>;
}
