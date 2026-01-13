import { ResidentAddressProps } from './resident-address-vo';
import { IHashManager } from '../../../ports/managers/i-bcrypt-hash-manager';
import { UserApartmentLinkProps } from './user-apartment-link-vo';

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT',
  NOTJOINEDRESIDENT = 'NOTJOINEDRESIDENT',
}

export type BaseUserProps = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly contact: string; // 전화번호
  readonly avatarUrl?: string; // 프로필 사진 url
  readonly role: Role;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  readonly userApartmentLink?: UserApartmentLinkProps[];
};

export type NotJoinedResidentProps = {
  readonly residentAddress: ResidentAddressProps;
} & BaseUserProps;

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
