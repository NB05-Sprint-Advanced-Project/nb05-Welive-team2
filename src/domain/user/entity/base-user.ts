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
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER', // Resident
}

export type BaseAllUserProps = {
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
  }): BaseAllUserProps => {
    return {
      ...props,
    };
  },

  updateAvatar: (user: BaseAllUserProps, newAvatarUrl: string): BaseAllUserProps => {
    return {
      ...user,
      avatarUrl: newAvatarUrl,
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
