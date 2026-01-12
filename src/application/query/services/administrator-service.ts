import { number } from 'zod';
import { IAdministratorQueryRepo } from '../../ports/repos/I.administrator.query.repo';

export const createAdministratorQueryService = (
  administratorQueryRepo: IAdministratorQueryRepo,
) => {
  const getAdministrators = (
    page: number,
    limit: number,
    searchKeyword: string,
    joinStatus: string,
  ) => {
    const administrators = administratorQueryRepo.findAll(page, limit, searchKeyword, joinStatus);
    return administrators;
  };

  return {
    getAdministrators,
  };
};
