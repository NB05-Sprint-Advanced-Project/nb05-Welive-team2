import { AdministratorView } from "../../query/views/administrator-view";
import { Status } from "@prisma/client"

export interface IAdministratorQueryRepo {
    findAll(
        page: number,
        limit: number,
        searchKeyword: string,
        joinStatus: Status
    ): Promise<AdministratorView>;
}
