import { Status } from '../entity/base-user';
import { AdministratorView } from '../dto/view/administrator';
import { UserView } from '../dto/view/user-view';
import { ResidentAccountView, ResidentsView, ResidentView } from '../dto/view/resident';
import { GetResidentsReqDto } from '../dto/resident-response';
import { GetResidentAccountsReqDto } from '../dto/user-request';

export interface IUserQueryRepo {
  findAllAdmins(
    page: number,
    limit: number,
    searchKeyword: string,
    joinStatus: Status,
  ): Promise<AdministratorView>;

  findByUsername(username: string): Promise<UserView | null>;
  
  findNotJoinedResidentByEmail: (email: string, userId: string) => Promise<ResidentView | null>;

  findResidentById: (id: string, userId: string) => Promise<ResidentView | null>;

  findResidents: (dto: GetResidentsReqDto) => Promise<ResidentsView>;

  findResidentAccounts: (dto: GetResidentAccountsReqDto) => Promise<ResidentAccountView>;
}
