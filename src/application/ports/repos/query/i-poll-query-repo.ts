<<<<<<< HEAD
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
=======
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
>>>>>>> cef6f2a ([fix] schema에 options 테이블 추가)
