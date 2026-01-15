export type UserApartmentLinkProps = {
  readonly apartmentId: string;
};

export const UserApartmentLinkVO = {
  create: (apartmentId: string): UserApartmentLinkProps => {
    return {
      apartmentId,
    };
  },

  restore: (apartmentId: string): UserApartmentLinkProps => {
    return {
      apartmentId,
    };
  },
};
