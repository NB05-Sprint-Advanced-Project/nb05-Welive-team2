import { randomUUID } from 'crypto';
import { ResidentAddressFields } from './resident-address-vo';
import { IHashManager } from '../../../ports/managers/i-bcrypt-hash-manager';

enum Status {
  PENDING,
  APPROVED,
  REJECTED,
}

export type UserFields = {
  readonly id: string;
  readonly username: string; // ID
  readonly password: string;
  readonly name: string;
  readonly email: string;
  readonly contact: Number; // 전화번호
  readonly avatarUrl?: string; // 프로필 사진 url
  readonly role: string;
  readonly joinedStatus: Status;
  readonly refreshToken?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  readonly residentAddress?: ResidentAddressFields;
};

export const UserEntity = {
  create: async (props: {
    username: string;
    password: string;
    name: string;
    email: string;
    contact: Number;
    role: string;
    joinedStatus: Status;
    hashManager: IHashManager;
    residentAddress?: ResidentAddressFields;
  }): Promise<UserFields> => {
    const { hashManager, ...rest } = props;
    const hashedPassword = await hashManager.hash(props.password);
    const now = new Date();

    return {
      ...rest,
      id: randomUUID(),
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
    contact: Number;
    avatarUrl?: string;
    role: string;
    joinedStatus: Status;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
    residentAddress?: ResidentAddressFields;
  }): UserFields => {
    return {
      ...props,
    };
  },

  // API 명세서에서 기존 데이터 + 수정할 데이터를 합쳐서 와서 각각 컬럼에 Optional를 안 줌
  update: (props: {
    user: UserFields;
    name: string;
    email: string;
    contact: Number;
    residentAddress?: ResidentAddressFields;
  }): UserFields => {
    const { name, email, contact, residentAddress, ...rest } = props.user;

    return {
      ...rest,
      name: props.name,
      email: props.email,
      contact: props.contact,
      residentAddress: residentAddress,
    };
  },

  updatePassword: async (
    user: UserFields,
    newPassword: string,
    hashManager: IHashManager,
  ): Promise<UserFields> => {
    const hashedPassword = await hashManager.hash(newPassword);

    return {
      ...user,
      password: hashedPassword,
    };
  },

  updateAvatar: (user: UserFields, newAvatarUrl: string): UserFields => {
    return {
      ...user,
      avatarUrl: newAvatarUrl,
    };
  },

  updateRefreshToken: async (
    user: UserFields,
    newRefreshToken: string,
    hashManager: IHashManager,
  ): Promise<UserFields> => {
    const hashedRefreshToken = await hashManager.hash(newRefreshToken);
    return {
      ...user,
      refreshToken: hashedRefreshToken,
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
