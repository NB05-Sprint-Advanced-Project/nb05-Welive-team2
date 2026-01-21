import { Role, Status } from '../../../user/entity/base-user';

export interface LoginView {
  id: string;
  username: string;
  password: string;
  email: string;
  contact: string;
  name: string;
  role: Role | string;
  avatar: string;
  joinStatus: Status;
  isActive: boolean;
  adminOf?: {
    id: string;
    name: string;
  };
  resident?: {
    id: string;
    apartmentId: string;
    building: number;
    unit: number;
    isHouseholder: boolean;
  };
}
