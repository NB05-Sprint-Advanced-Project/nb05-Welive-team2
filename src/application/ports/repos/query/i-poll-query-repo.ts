import { PollStatus } from '@prisma/client';
import { PollView } from '../../../query/views/poll-view';

export interface IPollQueryRepo {
  findById(pollId: string): Promise<PollView>;
  findAll(
    page: number,
    limit: number,
    searchKeyword: string,
    status: PollStatus,
    building: number,
  ): Promise<PollView[]>;
}
