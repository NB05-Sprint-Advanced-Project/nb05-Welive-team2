import { Status } from '../../entity/base-user';

export interface ResidentsView {
  data: ResidentView[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface ResidentView {
  id: string;
  userId: string | null;
  email: string;
  contact: string;
  name: string;
  building: number;
  unit: number;
  isHouseholder: boolean;
  createdAt: Date;
}

export interface ResidentAccountView {
  data: {
    id: string;
    email: string;
    contact: string;
    name: string;
    joinStatus: Status.APPROVED | Status.PENDING | Status.REJECTED;
    resident: {
      id: string;
      building: number;
      unit: number;
    };
  }[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
