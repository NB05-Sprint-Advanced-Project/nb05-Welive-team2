import { AdminDto, SuperAdminDto } from '../../../../inbound/responses/admin-response';
import { AdminProps } from '../../../command/entities/user/admin-account-entity';
import { Status } from '../../../command/entities/user/base-user-entity';

export interface IUserCommandRepo {
  /**
   *  @ throws UNIQUE_VIOLATION_EMAIL
   *  @ throws UNIQUE_VIOLATION_USERNAME
   *  @ throws UNIQUE_VIOLATION_CONTACT
   */
  createAdmin(entity: AdminProps): Promise<AdminProps>;

  findAdminById(adminId: string, role: string): Promise<AdminProps | null>;

  updateAdmin(entity: AdminProps): Promise<AdminProps>;

  approveAllAdmin(status: string): Promise<void>;

  approveAdmin(status: string, adminId: string): Promise<void>;
}
