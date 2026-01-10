import { randomUUID } from 'crypto';
import { ResidentAddressProps } from './resident-address-vo';
import { IHashManager } from '../../../ports/managers/i-bcrypt-hash-manager';
import { UserApartmentLinkProps } from './user-apartment-link-vo';

export enum Status {
  PENDING,
  APPROVED,
  REJECTED,
}

export enum Role {
  SUPERADMIN,
  ADMIN,
  RESIDENT,
  NOTJOINEDRESIENT,
}

export type UserProps = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly contact: Number; // 전화번호
  readonly avatarUrl?: string; // 프로필 사진 url
  readonly role: Role;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  readonly userApartmentLink: UserApartmentLinkProps[];
};

export type NotJoinedResidentProps = {
  readonly residentAddress: ResidentAddressProps;
} & UserProps;

export const UserEntity = {
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
