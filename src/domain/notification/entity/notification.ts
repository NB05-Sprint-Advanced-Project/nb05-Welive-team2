import { randomUUID } from 'crypto';

export type NotificationProps = {
  readonly id: string;
  readonly receiverId?: string;
  readonly content: string;
  readonly isChecked: boolean;
  readonly createdAt: Date;
};

export const NotificationEntity = {
  create: (props: { id: string; receiverId?: string; content: string }): NotificationProps => {
    return {
      createdAt: new Date(),
      isChecked: false,
      ...props,
    };
  },

  restore: (props: {
    id: string;
    receiverId?: string;
    content: string;
    isChecked: boolean;
    createdAt: Date;
  }): NotificationProps => {
    return {
      ...props,
    };
  },

  update: (props: { notification: NotificationProps; isChecked: boolean }): NotificationProps => {
    return {
      ...props.notification,
      isChecked: props.isChecked,
    };
  },
};
