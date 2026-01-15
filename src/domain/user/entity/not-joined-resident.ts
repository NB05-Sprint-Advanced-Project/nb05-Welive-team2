import { randomUUID } from 'crypto';
import { Role, BaseUserProps, Status } from './base-user';
import { ResidentAddressProps } from './vo/resident-address';
import { UserApartmentLinkProps } from './vo/user-apartment-link';

export type NotJoinedResidentProps = {
  readonly role: Role.RESIDENT;
  readonly joinedStatus: Status.NOT_JOINED;
  readonly address: ResidentAddressProps;
} & BaseUserProps;

export const NotJoinedResidentEntity = {
  create: (props: {
    name: string;
    email: string;
    contact: string;
    role: Role.RESIDENT;
    joinedStatus: Status.NOT_JOINED;
    address: ResidentAddressProps;
    userApartmentLink: UserApartmentLinkProps[];
  }): NotJoinedResidentProps => {
    const now = new Date();

    return {
      ...props,
      id: randomUUID(),
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
  },

  restore: (props: {
    id: string;
    name: string;
    email: string;
    contact: string;
    role: Role.RESIDENT;
    joinedStatus: Status.NOT_JOINED;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    address: ResidentAddressProps;
    userApartmentLink: UserApartmentLinkProps[];
  }): NotJoinedResidentProps => {
    return {
      ...props,
    };
  },

  update: (props: {
    user: NotJoinedResidentProps; // DB에 저장된 데이터
    name: string;
    email: string;
    contact: string;
    residentAddress?: ResidentAddressProps;
  }): NotJoinedResidentProps => {
    return {
      ...props.user,
      name: props.name,
      email: props.email,
      contact: props.contact,
      address: props.residentAddress!,
      version: props.user.version + 1,
      updatedAt: new Date(),
    };
  },
};
