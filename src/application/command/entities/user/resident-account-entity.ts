import { randomUUID } from 'crypto';
import { IHashManager } from '../../../ports/managers/i-bcrypt-hash-manager';
import { Role, Status, BaseUserProps } from './base-user-entity';
import { ResidentAddressProps } from './resident-address-vo';
import { UserApartmentLinkProps } from './user-apartment-link-vo';

export type ResidentAccountProps = {
  readonly username: string;
  readonly password: string;
  readonly joinedStatus: Status;
  readonly refreshToken?: string;

  readonly residentAddress: ResidentAddressProps;
} & BaseUserProps;

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
  }): Promise<ResidentAccountProps> => {
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
  }): ResidentAccountProps => {
    return {
      ...props,
    };
  },

  // API 명세서에서 기존 데이터 + 수정할 데이터를 합쳐서 와서 각각 컬럼에 Optional를 안 줌
  update: (props: {
    user: ResidentAccountProps; // DB에 저장된 데이터
    name: string;
    email: string;
    contact: string;
    residentAddress?: ResidentAddressProps;
  }): ResidentAccountProps => {
    const { name, email, contact, residentAddress, ...rest } = props.user;

    return {
      ...rest,
      name: props.name,
      email: props.email,
      contact: props.contact,
      residentAddress: residentAddress,
    };
  },

  updateJoinedStatus: (props: {
    user: ResidentAccountProps;
    joinedStatus: Status;
  }): ResidentAccountProps => {
    const { user, joinedStatus } = props;

    return {
      ...user,
      joinedStatus: joinedStatus,
    };
  },

  updatePassword: async (
    user: ResidentAccountProps,
    newPassword: string,
    hashManager: IHashManager,
  ): Promise<ResidentAccountProps> => {
    const hashedPassword = await hashManager.hash(newPassword);

    return {
      ...user,
      password: hashedPassword,
    };
  },

  updateRefreshToken: async (
    user: ResidentAccountProps,
    newRefreshToken: string,
    hashManager: IHashManager,
  ): Promise<ResidentAccountProps> => {
    const hashedRefreshToken = await hashManager.hash(newRefreshToken);
    return {
      ...user,
      refreshToken: hashedRefreshToken,
    };
  },
};
