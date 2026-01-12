import { Status } from '../../command/entities/user/base-user-entity';
import { IUserQueryRepo } from '../../ports/repos/query/i.user.query.repo';

export const createUserQueryService = (userQueryRepo: IUserQueryRepo) => {
  const getAdministrators = async (params: {
    page: number;
    limit: number;
    searchKeyword: string;
    joinStatus: Status;
  }) => {
    const administrators = await userQueryRepo.findAllAdmins(
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
