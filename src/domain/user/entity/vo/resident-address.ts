export type ResidentAddressProps = {
  readonly building: number; // 동
  readonly unit: number; // 호
  readonly isHouseholder: string; // 세대주이면 true, 세대원이면 false
};

export const ResidentAddressVO = {
  create: (props: {
    building: number;
    unit: number;
    isHouseholder: string;
  }): ResidentAddressProps => {
    return {
      ...props,
    };
  },

  restore: (props: {
    building: number;
    unit: number;
    isHouseholder: string;
  }): ResidentAddressProps => {
    return {
      ...props,
    };
  },

  /**
   * 기본 들어있는 값이 새로 들어온 값이랑 같으면 재생성 x,
   * 기본 들어있는 값이 새로 들어온 값이랑 다르면 재생성 o
   */
  isEqual: (currentAddress: ResidentAddressProps, newAddress: ResidentAddressProps): boolean => {
    return (
      currentAddress.building === newAddress.building &&
      currentAddress.unit === newAddress.unit &&
      currentAddress.isHouseholder === newAddress.isHouseholder
    );
  },
};
