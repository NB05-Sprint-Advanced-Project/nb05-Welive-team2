export type UserApartmentLinkProps = {
  readonly apartmentId: string;
};

export const UserApartmentLinkVO = {
  create: (props: { apartmentId: string }): UserApartmentLinkProps => {
    return {
      ...props,
    };
  },

  restore: (props: { apartmentId: string }): UserApartmentLinkProps => {
    return {
      ...props,
    };
  },
};
