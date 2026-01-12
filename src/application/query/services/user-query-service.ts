import { Status } from '../../command/entities/user/base-user-entity';
import { IUserQueryRepo } from '../../ports/repos/I.user.query.repo';

export const createUserQueryService = (userQueryRepo: IUserQueryRepo) => {
  const getAdministrators = (params: {
    page: number;
    limit: number;
    searchKeyword: string;
    joinStatus: Status;
  }) => {
    const administrators = userQueryRepo.findAllAdmins(
      params.page,
      params.limit,
      params.searchKeyword,
      params.joinStatus,
    );
    return administrators;
  };

  return {
    getAdministrators,
  };
};

export type UserQueryService = ReturnType<typeof createUserQueryService>;
