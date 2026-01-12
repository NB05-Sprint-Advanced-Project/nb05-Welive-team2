import { randomUUID } from 'crypto';
import { IHashManager } from '../../../ports/managers/i-bcrypt-hash-manager';
import { Role, Status, UserProps } from './base-user-entity';
import { UserApartmentLinkProps } from './user-apartment-link-vo';

export type AdminProps = {
  readonly username: string;
  readonly password: string;
  readonly joinedStatus: string;
  readonly refreshToken?: string;
} & UserProps;

export const AdminAccountEntity = {
  create: async (props: {
    username: string;
    password: string;
    name: string;
    email: string;
    contact: string;
    role: Role;
    hashManager: IHashManager;
    userApartmentLink?: UserApartmentLinkProps[];
  }): Promise<AdminProps> => {
    const { hashManager, ...rest } = props;
    const hashedPassword = await hashManager.hash(props.password);
    const now = new Date();

    return {
      ...rest,
      id: randomUUID(),
      joinedStatus: Status.PENDING,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };
  },

  restore: (props: {
    id: string;
    username: string;
    password: string;
    name: string;
    email: string;
    contact: string;
    avatarUrl?: string;
    role: Role;
    joinedStatus: Status;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
    userApartmentLink: UserApartmentLinkProps[];
  }): AdminProps => {
    return {
      ...props,
    };
  },

  update: (props: {
    user: AdminProps; // DB에 저장된 데이터
    name: string;
    email: string;
    contact: string;
  }): AdminProps => {
    const { name, email, contact, ...rest } = props.user;

    return {
      ...rest,
      name: props.name,
      email: props.email,
      contact: props.contact,
    };
  },

  updateJoinedStatus: (props: { user: AdminProps; joinedStatus: Status }): AdminProps => {
    const { user, joinedStatus } = props;

    return {
      ...user,
      joinedStatus: joinedStatus,
    };
  },

  updatePassword: async (
    user: AdminProps,
    newPassword: string,
    hashManager: IHashManager,
  ): Promise<AdminProps> => {
    const hashedPassword = await hashManager.hash(newPassword);

    return {
      ...user,
      password: hashedPassword,
    };
  },

  updateAvatar: (user: AdminProps, newAvatarUrl: string): AdminProps => {
    return {
      ...user,
      avatarUrl: newAvatarUrl,
    };
  },

  updateRefreshToken: async (
    user: AdminProps,
    newRefreshToken: string,
    hashManager: IHashManager,
  ): Promise<AdminProps> => {
    const hashedRefreshToken = await hashManager.hash(newRefreshToken);
    return {
      ...user,
      refreshToken: hashedRefreshToken,
    };
  },
};
