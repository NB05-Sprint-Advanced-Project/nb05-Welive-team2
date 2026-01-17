import { Status } from '../entity/base-user';
import { AdministratorView } from '../dto/view/administrator';
import { UserView } from '../dto/view/user-view';

export interface IUserQueryRepo {
  findAllAdmins(
    page: number,
    limit: number,
    searchKeyword: string,
    joinStatus: Status,
  ): Promise<AdministratorView>;

  findByUsername(username: string): Promise<UserView | null>;
}
