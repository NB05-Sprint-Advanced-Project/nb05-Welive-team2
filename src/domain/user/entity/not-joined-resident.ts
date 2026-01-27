import { randomUUID } from 'crypto';
import { Role, BaseAllUserProps, Status } from './base-user';
import { ResidentAddressProps } from './vo/resident-address';
import { UserApartmentLinkProps } from './vo/user-apartment-link';
import { SignUpResidentAccountReqDto } from '../dto/user-request';

export type NotJoinedResidentProps = {
  readonly role: Role.USER;
  readonly joinedStatus: Status.NOT_JOINED;
  readonly address: ResidentAddressProps;
} & BaseAllUserProps;

export const NotJoinedResidentEntity = {
  create: (props: {
    name: string;
    email: string;
    contact: string;
    address: ResidentAddressProps;
    userApartmentLink: UserApartmentLinkProps[];
  }): NotJoinedResidentProps => {
    const now = new Date();

    return {
      ...props,
      id: randomUUID(),
      role: Role.USER,
      joinedStatus: Status.NOT_JOINED,
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
    role: Role.USER;
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
    contact: string;
    residentAddress: ResidentAddressProps;
  }): NotJoinedResidentProps => {
    return {
      ...props.user,
      name: props.name,
      contact: props.contact,
      address: props.residentAddress!,
      updatedAt: new Date(),
    };
  },

  isNotJoinedResident: (
    requestdto: SignUpResidentAccountReqDto,
    DBuser: NotJoinedResidentProps,
  ): boolean => {
    return (
      requestdto.email === DBuser.email &&
      requestdto.name === DBuser.name &&
      requestdto.contact === DBuser.contact &&
      DBuser.userApartmentLink!.some(
        (livingApt) => requestdto.resident.apartmentId === livingApt.apartmentId,
      ) &&
      requestdto.resident.building === DBuser.address.building &&
      requestdto.resident.unit === DBuser.address.unit
    );
  },
};
