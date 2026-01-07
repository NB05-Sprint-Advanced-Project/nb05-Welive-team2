import { PollStatus } from '@prisma/client';
import { OptionEntity, OptionModel } from './option-entity';
import { randomUUID } from 'crypto';

export type PollModel = {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  title: string;
  content: string;
  status: PollStatus;
  startDate: Date;
  endDate: Date;
  readonly apartmentId: string;
  building: number;
  readonly userId: string;
  options: OptionModel[];
};
export const PollEntity = {
  create: (props: {
    title: string;
    content: string;
    startDate: Date;
    endDate: Date;
    apartmentId: string;
    building: number;
    options: OptionModel[];
  }): PollModel => {
    const now = new Date();

    let status: PollStatus = 'IN_PROGRESS';
    if (props.endDate < now) {
      status = 'CLOSED';
    } else if (props.startDate > now) {
      status = 'PENDING';
    }

    const userId = 'test'; // 추후 로그한 관리자의 id 가져오도록 수정

    return {
      ...props,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      userId,
      status,
    } as PollModel;
  },
  restore: (props: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    content: string;
    status: PollStatus;
    startDate: Date;
    endDate: Date;
    apartmentId: string;
    building: number;
    userId: string;
    options: OptionModel[];
  }): PollModel => {
    return { ...props } as PollModel;
  },
  update: (
    poll: PollModel,
    props: {
      title?: string;
      content?: string;
      startDate?: Date;
      endDate?: Date;
      building?: number;
      options?: {
        id?: string;
        title: string;
      }[];
    },
  ) => {
    if (props.title) {
      poll.title = props.title;
    }
    if (props.content) {
      poll.content = props.content;
    }
    if (props.startDate) {
      poll.startDate = props.startDate;
    }
    if (props.endDate) {
      poll.endDate = props.endDate;
    }
    if (props.building) {
      poll.building = props.building;
    }
    if (props.options) {
      const existOpt = props.options.filter((opt) => opt.id !== undefined);
      const newOpt = props.options.filter((opt) => !opt.id);

      for (const opt of newOpt) {
        poll.options.push(OptionEntity.create({ title: opt.title }));
      }

      for (const opt of existOpt) {
        const target = poll.options.find((befOpt) => befOpt.id === opt.id);
        if (target) {
          OptionEntity.updateTitle(target, opt.title);
        }
      }
    }
  },
  vote: (poll: PollModel, optionId: string) => {
    const target = poll.options.find((opt) => optionId);
    if (target) {
      OptionEntity.vote(target);
    }
  },
  cancle: (poll: PollModel, optionId: string) => {
    const target = poll.options.find((opt) => optionId);
    if (target) {
      OptionEntity.cancle(target);
    }
  },
};
