import { Role } from '../../user/entity/base-user';

export interface StateResponseDto {
  stateId: string;
  payloadId: string;
  userId?: string;
  content: string;
  apartmentId?: string;
  receiverType: Role;
}
