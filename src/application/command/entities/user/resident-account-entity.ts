import { randomUUID } from 'crypto';
import { IHashManager } from '../../../ports/managers/i-bcrypt-hash-manager';
import { Role, Status, UserProps } from './base-user-entity';
import { ResidentAddressProps } from './resident-address-vo';
import { UserApartmentLinkProps } from './user-apartment-link-vo';

export type ResidentProps = {
  readonly username: string;
  readonly password: string;
  readonly joinedStatus: Status;
  readonly refreshToken?: string;

  readonly residentAddress: ResidentAddressProps;
} & UserProps;

export const ResidentAccountEntity = {
  create: async (props: {
    username: string;
    password: string;
    name: string;
    email: string;
    contact: string;
    role: Role;
    hashManager: IHashManager;
    residentAddress: ResidentAddressProps;
    userApartmentLink: UserApartmentLinkProps[];
  }): Promise<ResidentProps> => {
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
    residentAddress: ResidentAddressProps;
    userApartmentLink: UserApartmentLinkProps[];
  }): ResidentProps => {
    return {
      ...props,
    };
  },

  // API 명세서에서 기존 데이터 + 수정할 데이터를 합쳐서 와서 각각 컬럼에 Optional를 안 줌
  update: (props: {
    user: ResidentProps; // DB에 저장된 데이터
    name: string;
    email: string;
    contact: string;
    residentAddress?: ResidentAddressProps;
  }): ResidentProps => {
    const { name, email, contact, residentAddress, ...rest } = props.user;

    return {
      ...rest,
      name: props.name,
      email: props.email,
      contact: props.contact,
      residentAddress: residentAddress,
    };
  },

  updateJoinedStatus: (props: { user: ResidentProps; joinedStatus: Status }): ResidentProps => {
    const { user, joinedStatus } = props;

    return {
      ...user,
      joinedStatus: joinedStatus,
    };
  },

  updatePassword: async (
    user: ResidentProps,
    newPassword: string,
    hashManager: IHashManager,
  ): Promise<ResidentProps> => {
    const hashedPassword = await hashManager.hash(newPassword);

    return {
      ...user,
      password: hashedPassword,
    };
  },

  updateAvatar: (user: ResidentProps, newAvatarUrl: string): ResidentProps => {
    return {
      ...user,
      avatarUrl: newAvatarUrl,
    };
  },

  updateRefreshToken: async (
    user: ResidentProps,
    newRefreshToken: string,
    hashManager: IHashManager,
  ): Promise<ResidentProps> => {
    const hashedRefreshToken = await hashManager.hash(newRefreshToken);
    return {
      ...user,
      refreshToken: hashedRefreshToken,
    };
  },
};
