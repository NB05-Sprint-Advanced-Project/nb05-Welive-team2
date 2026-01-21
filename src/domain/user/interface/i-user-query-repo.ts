import { Status } from '../entity/base-user';
import { AdministratorView } from '../dto/view/administrator';
import { ResidentAccountView, ResidentsView, ResidentView } from '../dto/view/resident';
import { GetResidentsReqDto } from '../dto/resident-user-response';
import { GetResidentAccountsReqDto } from '../dto/user-request';
import { LoginView } from '../../auth/controller/view/log-in';

export interface IUserQueryRepo {
  findAllAdmins(
    page: number,
    limit: number,
    searchKeyword: string,
    joinStatus?: Status,
  ): Promise<AdministratorView>;

  findByUsername(username: string): Promise<LoginView | null>;

  findNotJoinedResidentByEmail: (email: string, userId: string) => Promise<ResidentView | null>;

  findResidentById: (id: string) => Promise<ResidentView | null>;

  findResidents: (dto: GetResidentsReqDto) => Promise<ResidentsView>;

  findResidentAccounts: (dto: GetResidentAccountsReqDto) => Promise<ResidentAccountView>;
}
