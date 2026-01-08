export type ResidentAddressFields = {
  readonly building: string; // 동
  readonly unit: string; // 호
  readonly isHouseholder: boolean; // 세대주이면 true, 세대원이면 false
};

export const ResidentAddressVO = {
  create: (props: {
    building: string;
    unit: string;
    isHouseholder: boolean;
  }): ResidentAddressFields => {
    return {
      ...props,
    };
  },

  restore: (props: {
    building: string;
    unit: string;
    isHouseholder: boolean;
  }): ResidentAddressFields => {
    return {
      ...props,
    };
  },

  isEqual: (
    previousAddress: ResidentAddressFields,
    nextAddress: ResidentAddressFields,
  ): boolean => {
    return (
      previousAddress.building === nextAddress.building &&
      previousAddress.unit === nextAddress.unit &&
      previousAddress.isHouseholder === nextAddress.isHouseholder
    );
  },
};
