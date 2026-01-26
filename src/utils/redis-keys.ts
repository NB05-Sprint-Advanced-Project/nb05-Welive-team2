import { ComplaintStatus } from '../domain/complaint/complaint-entity';
import { GetResidentsReqDto } from '../domain/user/dto/resident-user-response';
import { GetResidentAccountsReqDto } from '../domain/user/dto/user-request';

export const redisKeys = {
  authToken: (accessToken: string) => {
    const key = `auth:token:${accessToken}`;
    return key;
  },

  administratorsList: (params: {
    page: number;
    limit: number;
    searchKeyword: string;
    joinStatus?: string;
  }) => {
    const key = `administrators:list:${params.page}:${params.limit}:${params.searchKeyword}:${params.joinStatus}`;
    const lock = `lock:administrators:list:${params.page}:${params.limit}:${params.searchKeyword}:${params.joinStatus}`;
    return { key, lock };
  },

  apartmentsList: (params: { page: number; limit: number; searchKeyword: string }) => {
    const key = `apartments:list:${params.page}:${params.limit}:${params.searchKeyword}`;
    const lock = `lock:apartments:list:${params.page}:${params.limit}:${params.searchKeyword}`;
    return { key, lock };
  },

  apartmentById: (params: { apartmentId: string }) => {
    const key = `apartment:by-id:${params.apartmentId}`;
    const lock = `lock:apartment:by-id:${params.apartmentId}`;
    return { key, lock };
  },

  residentAccounts: (dto: GetResidentAccountsReqDto) => {
    const key = 'residentAccounts:1:10'; // 기본 첫 페이지
    const lock = 'lock:residentAccounts:1:10';
    return { key, lock };
  },

  residents: (dto: GetResidentsReqDto) => {
    const key = 'residents:1:10';
    const lock = 'lock:residents:1:10';
    return { key, lock };
  },

  complaintById: (complaintId: string) => {
    const key = `complaint:${complaintId}`;
    const lock = `lock:complaint:${complaintId}`;
    return { key, lock };
  },

  complaintsList: (params: {
    userId: string;
    page: number;
    limit: number;
    status?: ComplaintStatus;
    isPublic?: boolean;
  }) => {
    const statusKey = params.status ?? 'ALL';
    const publicKey = params.isPublic === undefined ? 'ALL' : params.isPublic ? '1' : '0';
    const key = `complaints:list:${params.userId}:${params.page}:${params.limit}:status:${statusKey}:public:${publicKey}`;
    const lock = `lock:complaints:list:${params.userId}:${params.page}:${params.limit}:status:${statusKey}:public:${publicKey}`;

    return { key, lock };
  },
};
