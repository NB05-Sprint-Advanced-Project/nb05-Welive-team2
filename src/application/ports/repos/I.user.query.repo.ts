import { Status } from '../../command/entities/user/base-user-entity';
import { AdministratorView } from '../../query/views/administrator-view';

export interface IUserQueryRepo {
  findAllAdmins(
    page: number,
    limit: number,
    searchKeyword: string,
    joinStatus: Status,
  ): Promise<AdministratorView>;
}
