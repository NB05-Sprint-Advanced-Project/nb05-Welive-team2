import { randomUUID } from 'crypto';

export type ApartmentProps = {
  readonly id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  address: string;
  description: string;
  officeNumber: string;
  buildingNumberFrom: number;
  buildingNumberTo: number;
  floorCountPerBuilding: number;
  unitCountPerFloor: number;
};

export const ApartmentEntity = {
  create: (props: {
    name: string;
    address: string;
    description: string;
    officeNumber: string;
    buildingNumberFrom: number;
    buildingNumberTo: number;
    floorCountPerBuilding: number;
    unitCountPerFloor: number;
  }): ApartmentProps => {
    const now = new Date();

    return {
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      name: props.name,
      address: props.address,
      description: props.description,
      officeNumber: props.officeNumber,
      buildingNumberFrom: props.buildingNumberFrom,
      buildingNumberTo: props.buildingNumberTo,
      floorCountPerBuilding: props.floorCountPerBuilding,
      unitCountPerFloor: props.unitCountPerFloor,
    } as ApartmentProps;
  },
};
