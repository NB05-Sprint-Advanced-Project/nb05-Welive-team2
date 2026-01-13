import { randomUUID } from 'node:crypto';

export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type ComplaintProps = {
  id: string;
  title: string;
  content: string;
  status: ComplaintStatus;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewsCount: number;
  apartmentId: string;
  userId: string;
};

export const ComplaintEntity = {
  create: (props: {
    title: string;
    content: string;
    isPublic: boolean;
    apartmentId: string;
    userId: string;
  }): ComplaintProps => {
    const now = new Date();

    return {
      ...props,
      id: randomUUID(),
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
      viewsCount: 0,
    };
  },
  restore: (props: {
    id: string;
    title: string;
    content: string;
    status: ComplaintStatus;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    viewsCount: number;
    apartmentId: string;
    userId: string;
  }): ComplaintProps => {
    return { ...props };
  },
  update: (
    beforeContext: ComplaintProps,
    props: {
      title?: string;
      content?: string;
      isPublic?: boolean;
    },
  ): ComplaintProps => {
    return {
      ...beforeContext,
      title: props.title && props.title.trim() !== '' ? props.title : beforeContext.title,
      content: props.content ?? beforeContext.content,
      isPublic: props.isPublic ?? beforeContext.isPublic,
      updatedAt: new Date(),
    };
  },
  updateStatus: (
    beforeContext: ComplaintProps,
    props: { status: ComplaintStatus },
  ): ComplaintProps => {
    return {
      ...beforeContext,
      status: props.status,
      updatedAt: new Date(),
    };
  },
};
