import { ResidentAddressProps } from './vo/resident-address';
import { IHashManager } from '../../../shared/interface/i-bcrypt-hash-manager';
import { UserApartmentLinkProps } from './vo/user-apartment-link';

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NOT_JOINED = 'NOT_JOINED',
}

export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT',
}

export type BaseUserProps = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly contact: string; // 전화번호
  readonly avatarUrl?: string; // 프로필 사진 url
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  readonly userApartmentLink?: UserApartmentLinkProps[];
};

export const BaseUserEntity = {
  restore: (props: {
    id: string;
    name: string;
    email: string;
    contact: string;
    avatarUrl?: string;
    role: Role;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    userApartmentLink: UserApartmentLinkProps[];
  }): BaseUserProps => {
    return {
      ...props,
    };
  },

  updateAvatar: (user: BaseUserProps, newAvatarUrl: string): BaseUserProps => {
    return {
      ...user,
      avatarUrl: newAvatarUrl,
      version: user.version + 1,
      updatedAt: new Date(),
    };
  },

  isPasswordMatch: async (
    currentPassword: string,
    newPassword: string,
    hashManager: IHashManager,
  ): Promise<boolean> => {
    return await hashManager.compare(newPassword, currentPassword);
  },

  isRefreshTokenMatch: async (
    currentRefreshToken: string,
    newRefreshToken: string,
    hashManager: IHashManager,
  ): Promise<boolean> => {
    return await hashManager.compare(newRefreshToken, currentRefreshToken);
  },
};
