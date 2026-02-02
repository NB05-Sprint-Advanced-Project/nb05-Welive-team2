import { NoticeCategory } from '@prisma/client';
import { EventEntity, EventProps } from './event';
import { randomUUID } from 'crypto';

type AuthorProps = {
  readonly id: string;
  name: string;
};
export type NoticeProps = {
  readonly id: string;
  readonly createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  category: NoticeCategory;
  isPinned: boolean;
  viewCount: number;
  readonly apartmentId: string;
  readonly userId: string;
  comments?: Comment[];
  event?: EventProps;
  author?: AuthorProps;

  version: number;
};

export const NoticeEntity = {
  create: (props: {
    title: string;
    content: string;
    category: NoticeCategory;
    isPinned: boolean;
    apartmentId: string;
    event?: {
      startDate: Date;
      endDate: Date;
    };
  }): NoticeProps => {
    const { event, ...data } = props;
    const version = 1;
    let createdEvent;
    if (event) {
      createdEvent = EventEntity.create(event);
    }
    const now = new Date();
    const userId = 'test'; // 추후 로그한 관리자의 id 가져오도록 수정

    return {
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      userId,
      event: createdEvent,
      version,
    };
  },
  update: (
    notice: NoticeProps,
    props: {
      title?: string;
      content?: string;
      category?: NoticeCategory;
      isPinned?: boolean;
      event?: {
        startDate: Date;
        endDate: Date;
      };
    },
  ): NoticeProps => {
    if (props.title) {
      notice.title = props.title;
    }
    if (props.content) {
      notice.content = props.content;
    }
    if (props.category) {
      notice.category = props.category;
    }
    if (props.isPinned) {
      notice.isPinned = props.isPinned;
    }
    if (props.event) {
      if (notice.event) {
        EventEntity.updateDate(notice.event, props.event);
      } else {
        notice.event = EventEntity.create(props.event);
      }
    }
    return notice as NoticeProps;
  },
};
