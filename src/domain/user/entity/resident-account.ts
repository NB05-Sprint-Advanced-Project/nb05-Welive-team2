import { randomUUID } from 'crypto';
import { IHashManager } from '../../../shared/interface/i-bcrypt-hash-manager';
import { Role, Status, BaseUserProps } from './base-user';
import { ResidentAddressProps } from './vo/resident-address';
import { UserApartmentLinkProps } from './vo/user-apartment-link';
import { NotJoinedResidentProps } from './not-joined-resident';
import { SignUpResidentAccountReqDto } from '../dto/user-request';

export type ResidentAccountProps = {
  readonly username: string;
  readonly password: string;
  readonly role: Role.RESIDENT;
  readonly joinedStatus: Status.APPROVED | Status.PENDING | Status.REJECTED;
  readonly refreshToken?: string;

  readonly address: ResidentAddressProps;
} & BaseUserProps;

export const ResidentAccountEntity = {
  create: async (props: {
    username: string;
    password: string;
    name: string;
    email: string;
    contact: string;
    hashManager: IHashManager;
    address: ResidentAddressProps;
    userApartmentLink: UserApartmentLinkProps[];
  }): Promise<ResidentAccountProps> => {
    const { hashManager, ...rest } = props;
    const hashedPassword = await hashManager.hash(props.password);
    const now = new Date();

    return {
      ...rest,
      id: randomUUID(),
      role: Role.RESIDENT,
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
    role: Role.RESIDENT;
    joinedStatus: Status.APPROVED | Status.PENDING | Status.REJECTED;
    refreshToken?: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    address: ResidentAddressProps;
    userApartmentLink: UserApartmentLinkProps[];
  }): ResidentAccountProps => {
    return {
      ...props,
    };
  },

  update: (props: {
    user: ResidentAccountProps; // DB에 저장된 데이터
    name: string;
    contact: string;
    residentAddress: ResidentAddressProps;
  }): ResidentAccountProps => {
    return {
      ...props.user,
      name: props.name,
      contact: props.contact,
      address: props.residentAddress!,
      updatedAt: new Date(),
    };
  },

  updateJoinedStatus: (
    user: ResidentAccountProps,
    joinedStatus: Status.APPROVED | Status.PENDING | Status.REJECTED,
  ): ResidentAccountProps => {
    return {
      ...user,
      joinedStatus: joinedStatus,
      updatedAt: new Date(),
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
      updatedAt: new Date(),
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
      updatedAt: new Date(),
    };
  },

  // 미가입 입주민을 가입 상태로 승격(NOT_JOINED → PENDING)
  requestJoin: async (
    notJoinedResident: NotJoinedResidentProps,
    dto: SignUpResidentAccountReqDto,
    hashManager: IHashManager,
  ): Promise<ResidentAccountProps> => {
    const hashedPassword = await hashManager.hash(dto.password);

    return {
      ...notJoinedResident,
      username: dto.username,
      password: hashedPassword,
      joinedStatus: Status.PENDING,
      updatedAt: new Date(),
    };
  },
};
