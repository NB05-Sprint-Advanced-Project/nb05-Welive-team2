import { randomUUID } from 'crypto';
import { Role, BaseUserProps } from './base-user-entity';
import { ResidentAddressProps } from './resident-address-vo';
import { UserApartmentLinkProps } from './user-apartment-link-vo';

export type ResidentProps = {
  readonly residentAddress: ResidentAddressProps;
} & BaseUserProps;

export const ResidentEntity = {
  create: (props: {
    name: string;
    email: string;
    contact: string;
    role: Role;
    residentAddress: ResidentAddressProps;
    userApartmentLink: UserApartmentLinkProps[];
  }): ResidentProps => {
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
    role: Role;
    createdAt: Date;
    updatedAt: Date;
    version: number;
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
};
