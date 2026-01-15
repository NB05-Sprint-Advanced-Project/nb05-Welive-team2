import { Status } from '../entity/base-user';
import { AdministratorView } from '../dto/view/administrator';

export interface IUserQueryRepo {
  findAllAdmins(
    page: number,
    limit: number,
    searchKeyword: string,
    joinStatus: Status,
  ): Promise<AdministratorView>;
}
