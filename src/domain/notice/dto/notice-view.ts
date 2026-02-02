import { NoticeCategory } from '@prisma/client';

export interface NoticeView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  category: NoticeCategory;
  isPinned: boolean;
  viewsCount: number;
  apartmentId: string;

  author: {
    id: string;
    name: string;
  };
  commentCount: number;

  event: {
    id: string;
    startDate: Date;
    endDate: Date;
  } | null;
}

export interface NoticesView {
  data: Omit<NoticeView, 'event'>[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
