import { randomUUID } from 'crypto';
import { Role, UserProps } from './base-user-entity';
import { ResidentAddressProps } from './resident-address-vo';
import { UserApartmentLinkProps } from './user-apartment-link-vo';

export type NotJoinedResidentProps = {
  readonly residentAddress: ResidentAddressProps;
} & UserProps;

export const ResidentEntity = {
  create: (props: {
    name: string;
    email: string;
    contact: string;
    role: Role;
    residentAddress: ResidentAddressProps;
    userApartmentLink: UserApartmentLinkProps[];
  }): NotJoinedResidentProps => {
    const now = new Date();

    return {
      ...props,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
  },

  restore: (props: {
    id: string;
    name: string;
    email: string;
    contact: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
    residentAddress: ResidentAddressProps;
    userApartmentLink: UserApartmentLinkProps[];
  }): NotJoinedResidentProps => {
    return {
      ...props,
    };
  },

  // API 명세서에서 기존 데이터 + 수정할 데이터를 합쳐서 와서 각각 컬럼에 Optional를 안 줌
  update: (props: {
    user: NotJoinedResidentProps; // DB에 저장된 데이터
    name: string;
    email: string;
    contact: string;
    residentAddress?: ResidentAddressProps;
  }): NotJoinedResidentProps => {
    const { name, email, contact, residentAddress, ...rest } = props.user;

    return {
      ...rest,
      name: props.name,
      email: props.email,
      contact: props.contact,
      residentAddress: residentAddress,
    };
  },
};
