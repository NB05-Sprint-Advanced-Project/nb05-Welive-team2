import { randomUUID } from 'crypto';
import { IHashManager } from '../../../shared/interface/i-bcrypt-hash-manager';
import { Role, Status, BaseAllUserProps } from './base-user';
import { UserApartmentLinkProps } from './vo/user-apartment-link';

export type AdminAccountProps = {
  readonly username: string;
  readonly password: string;
  readonly role: Role.ADMIN | Role.SUPER_ADMIN;
  readonly joinedStatus: Status;
  readonly refreshToken?: string;
} & BaseAllUserProps;

export const AdminAccountEntity = {
  create: async (props: {
    username: string;
    password: string;
    name: string;
    email: string;
    contact: string;
    role: Role.ADMIN | Role.SUPER_ADMIN;
    hashManager: IHashManager;
    userApartmentLink?: UserApartmentLinkProps[];
  }): Promise<AdminAccountProps> => {
    const { hashManager, ...rest } = props;
    const hashedPassword = await hashManager.hash(props.password);
    const now = new Date();

    return {
      ...rest,
      id: randomUUID(),
      joinedStatus: Status.PENDING,
      password: hashedPassword,
      version: 1,
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
    role: Role.ADMIN | Role.SUPER_ADMIN;
    joinedStatus: Status.APPROVED | Status.PENDING | Status.REJECTED;
    refreshToken?: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    userApartmentLink: UserApartmentLinkProps[];
  }): AdminAccountProps => {
    return {
      ...props,
    };
  },

  update: (props: {
    user: AdminAccountProps; // DB에 저장된 데이터
    name: string;
    email: string;
    contact: string;
  }): AdminAccountProps => {
    return {
      ...props.user,
      name: props.name,
      email: props.email,
      contact: props.contact,
      updatedAt: new Date(),
    };
  },

  updateJoinedStatus: (
    user: AdminAccountProps,
    joinedStatus: Status.APPROVED | Status.PENDING | Status.REJECTED,
  ): AdminAccountProps => {
    return {
      ...user,
      joinedStatus: joinedStatus,
      updatedAt: new Date(),
    };
  },

  updatePassword: async (
    user: AdminAccountProps,
    newPassword: string,
    hashManager: IHashManager,
  ): Promise<AdminAccountProps> => {
    const hashedPassword = await hashManager.hash(newPassword);

    return {
      ...user,
      password: hashedPassword,
      updatedAt: new Date(),
    };
  },

  updateRefreshToken: async (
    user: AdminAccountProps,
    newRefreshToken: string,
    hashManager: IHashManager,
  ): Promise<AdminAccountProps> => {
    const hashedRefreshToken = await hashManager.hash(newRefreshToken);
    return {
      ...user,
      refreshToken: hashedRefreshToken,
      updatedAt: new Date(),
    };
  },
};
