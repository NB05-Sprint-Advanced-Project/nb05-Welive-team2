import { PollStatus } from '@prisma/client';
import { PollsView, PollView } from '../dto/poll-view';

export interface IPollQueryRepo {
  findById(pollId: string, userId: string): Promise<PollView | null>;
  findAll(
    page: number,
    limit: number,
    searchKeyword: string,
    status: PollStatus | 'ALL',
    building: number,
  ): Promise<PollsView>;
}
