import { Role } from '../../user/entity/base-user';

export interface StateResponseDto {
  id: string;
  userId?: string;
  content: string;
  apartmentId?: string;
  receiverType: Role;
}
