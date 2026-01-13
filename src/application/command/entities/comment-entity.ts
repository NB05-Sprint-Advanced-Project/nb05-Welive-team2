import { randomUUID } from 'node:crypto';

export type CommentProps = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  noticeId?: string | null;
  complaintId?: string | null;
};

export const CommentEntity = {
  create: (props: {
    content: string;
    userId: string;
    resourceId: string;
    resourceType: 'COMPLAINT' | 'NOTICE';
  }): CommentProps => {
    const now = new Date();

    const fieldId = {
      complaintId: props.resourceType === 'COMPLAINT' ? props.resourceId : null,
      noticeId: props.resourceType === 'NOTICE' ? props.resourceId : null,
    };

    return {
      ...props,
      ...fieldId,
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
