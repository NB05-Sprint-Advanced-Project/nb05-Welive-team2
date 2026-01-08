import { NoticeCategory } from '@prisma/client';
import { EventEntity, EventModel } from './event-entity';
import { randomUUID } from 'crypto';

export type NoticeModel = {
  readonly id: string;
  readonly createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  category: NoticeCategory;
  isPinned: Boolean;
  viewCount: number;
  readonly apartmentId: string;
  readonly userId: string;
  // comments: Comment[];
  event?: EventModel;
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
  }): NoticeModel => {
    const { event, ...data } = props;
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
    };
  },
  update: (
    notice: NoticeModel,
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
  ): NoticeModel => {
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
    return notice as NoticeModel;
  },
};
