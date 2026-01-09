import { AdminDto } from "../../../../inbound/responses/admin-response";

export interface IAdminCommandRepo {
    findAdminById(adminId: string): Promise<AdminDto>;
    createSuperAdmin(model: ): Promise<>;
    createAdmin(model: )
    update(model: PollModel): Promise<void>;
    delete(pollId: string): Promise<void>;
}
