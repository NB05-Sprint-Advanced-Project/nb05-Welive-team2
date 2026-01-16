import { randomUUID } from 'crypto';
import { IHashManager } from '../../../shared/interface/i-bcrypt-hash-manager';
import { Role, Status, BaseUserProps } from './base-user';
import { UserApartmentLinkProps } from './vo/user-apartment-link';

export type AdminAccountProps = {
  readonly username: string;
  readonly password: string;
  readonly role: Role.ADMIN | Role.SUPERADMIN;
  readonly joinedStatus: Status.APPROVED | Status.PENDING | Status.REJECTED;
  readonly refreshToken?: string;
} & BaseUserProps;

export const AdminAccountEntity = {
  create: async (props: {
    username: string;
    password: string;
    name: string;
    email: string;
    contact: string;
    role: Role.ADMIN | Role.SUPERADMIN;
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
    role: Role.ADMIN | Role.SUPERADMIN;
    joinedStatus: Status.APPROVED | Status.PENDING | Status.REJECTED;
    refreshToken?: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    userApartmentLink: UserApartmentLinkProps[];
  }): AdminAccountProps => {
    return {
      ...props,
      version: 1,
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
      version: props.user.version + 1,
      updatedAt: new Date(),
    };
  },

  updateJoinedStatus: (
    user: AdminAccountProps,
    joinedStatus: Status.APPROVED | Status.REJECTED,
  ): AdminAccountProps => {
    return {
      ...user,
      joinedStatus: joinedStatus,
      version: user.version + 1,
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
      version: user.version + 1,
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
      version: user.version + 1,
      updatedAt: new Date(),
    };
  },
};
