import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { GetResidentReqDto, GetResidentsReqDto } from '../dto/resident-user-response';
import { IRedisExtenal } from '../../../shared/interface/i-redis';
import { GetResidentAccountsReqDto } from '../dto/user-request';
import { AdministratorView } from '../dto/view/administrator';
import { ResidentAccountView, ResidentsView, ResidentView } from '../dto/view/resident';
import { Status } from '../entity/base-user';
import { IUserQueryRepo } from '../interface/i-user-query-repo';
import { redisKeys } from '../../../utils/redis-keys';
import { randomUUID } from 'node:crypto';

export const createUserQueryService = (
  userQueryRepo: IUserQueryRepo,
  redisExternal: IRedisExtenal,
) => {
  const getAdministrators = async (params: {
    page: number;
    limit: number;
    searchKeyword: string;
    joinStatus?: Status;
  }) => {
    let administrators: AdministratorView | null = null;
    const key = redisKeys.administratorViews;
    const cache = await redisExternal.get(key); // 통째로 캐싱, 가져옴

    if (cache) {
      administrators = JSON.parse(cache); // 캐시가 존재하면 파싱해서 반환
    } else {
      for (let i = 0; i < 10; i++) {
        const lockToken = randomUUID();
        const isLocked = await redisExternal.setIfNotExist('lock:administratorsView', lockToken, 3);

        if (isLocked) {
          try {
            administrators = await userQueryRepo.findAllAdmins(
              params.page,
              params.limit,
              params.searchKeyword,
              params.joinStatus,
            );

            await redisExternal.set(key, JSON.stringify(administrators), 3);
          } finally {
            await redisExternal.delifmatch('lock:administratorsView', lockToken);
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const result = await redisExternal.get(key);
          if (result) {
            administrators = JSON.parse(result);
            break;
          }
        }
      }
    }

    return administrators;
  };

  const getResidentByEmail = async (email: string, userId: string): Promise<ResidentView> => {
    const notJoidedResidentUser = await userQueryRepo.findNotJoinedResidentByEmail(email, userId);

    if (!notJoidedResidentUser) {
      throw BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    return notJoidedResidentUser;
  };

  const getResidentById = async (dto: GetResidentReqDto): Promise<ResidentView> => {
    const notJoidedResidentUser = await userQueryRepo.findResidentById(dto.id, dto.userId);

    if (!notJoidedResidentUser) {
      throw BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    return notJoidedResidentUser;
  };

  const getResidents = async (dto: GetResidentsReqDto): Promise<ResidentsView> => {
    const notJoidedResidentUser = await userQueryRepo.findResidents(dto);
    return notJoidedResidentUser;
  };

  const getResidentAccounts = async (
    dto: GetResidentAccountsReqDto,
  ): Promise<ResidentAccountView> => {
    const residentAccountsUser = await userQueryRepo.findResidentAccounts(dto);

    return residentAccountsUser;
  };

  return {
    getAdministrators,
    getResidentByEmail,
    getResidentById,
    getResidents,
    getResidentAccounts,
  };
};

export type UserQueryService = ReturnType<typeof createUserQueryService>;
