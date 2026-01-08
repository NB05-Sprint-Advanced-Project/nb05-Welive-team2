import { AdministratorView } from "../../query/views/administrator-view";


export interface IAdministratorQueryRepo {
    findAll(
        page: number,
        limit: number,
        searchKeyword: string,
        joinStatus: string
    ): Promise<AdministratorView>[];
}