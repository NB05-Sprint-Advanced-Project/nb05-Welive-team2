export type ResidentAddressProps = {
  readonly building: string; // 동
  readonly unit: string; // 호
  readonly isHouseholder: boolean; // 세대주이면 true, 세대원이면 false
};

export const ResidentAddressVO = {
  create: (props: {
    building: string;
    unit: string;
    isHouseholder: boolean;
  }): ResidentAddressProps => {
    return {
      ...props,
    };
  },

  restore: (props: {
    building: string;
    unit: string;
    isHouseholder: boolean;
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
