import { Status } from "../../command/entities/user/base-user-entity";
import { AdministratorView } from "../../query/views/administrator-view";

export interface IAdministratorQueryRepo {
    findAll(
        page: number,
        limit: number,
        searchKeyword: string,
        joinStatus: Status
    ): Promise<AdministratorView>;
}
