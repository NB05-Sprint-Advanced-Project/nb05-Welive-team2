import { Role } from '../../user/entity/base-user';

export type NotificationProps = {
  readonly id: string;
  readonly receiverId?: string;
  readonly receiverType?: Role;
  readonly content: string;
  readonly isChecked: boolean;
  readonly createdAt: Date;
};

export const NotificationEntity = {
  create: (props: {
    id: string;
    receiverId?: string;
    receiverType?: Role;
    content: string;
  }): NotificationProps => {
    return {
      createdAt: new Date(),
      isChecked: false,
      ...props,
    };
  },

  restore: (props: {
    id: string;
    receiverId?: string;
    receiverType?: Role;
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
