import { Status } from "../../command/entities/user/base-user-entity";
import { IAdministratorQueryRepo } from "../../ports/repos/I.administrator.query.repo";

export const createAdministratorQueryService = (
  administratorQueryRepo: IAdministratorQueryRepo,
) => {

  const getAdministrators = (page: number, limit: number, searchKeyword: string, joinStatus: Status) => {
    const administrators = administratorQueryRepo.findAll(
      page,
      limit,
      searchKeyword,
      joinStatus
    );
    return administrators;
  };

  return {
    getAdministrators,
  };
};
