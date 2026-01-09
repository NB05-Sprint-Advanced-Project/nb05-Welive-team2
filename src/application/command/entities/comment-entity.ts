import { randomUUID } from 'node:crypto';

export type CommentProps = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  complaintId?: string;
  noticeId?: string;
};

export const CommentEntity = {
  create: (props: {
    content: string;
    userId: string;
    complaintId?: string;
    noticeId?: string;
  }): CommentProps => {
    const now = new Date();

    return {
      ...props,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
  },
  update: (
    beforeContext: CommentProps,
    props: {
      content: string;
    },
  ): CommentProps => {
    return {
      ...beforeContext,
      content: props.content,
      updatedAt: new Date(),
    };
  },
};
