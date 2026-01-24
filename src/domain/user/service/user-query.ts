import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { GetResidentReqDto, GetResidentsReqDto } from '../dto/resident-user-response';
import { GetResidentAccountsReqDto } from '../dto/user-request';
import { ResidentAccountView, ResidentsView, ResidentView } from '../dto/view/resident';
import { Status } from '../entity/base-user';
import { IUserQueryRepo } from '../interface/i-user-query-repo';
import { redisKeys } from '../../../utils/redis-keys';
import { IRedisExternal } from '../../../shared/interface/i-redis';
import { IRedisLocker } from '../../../shared/interface/i-redis-locker';

export const createUserQueryService = (
  userQueryRepo: IUserQueryRepo,
  redisLocker: IRedisLocker,
) => {
  const getAdministrators = async (params: {
    page: number;
    limit: number;
    searchKeyword: string;
    joinStatus?: Status;
  }) => {
    const { key, lock } = redisKeys.administratorsList({
      ...params,
    });

    const administrators = await redisLocker.doWork({
      key,
      lockKey: lock,
      work: userQueryRepo.findAllAdmins(
        params.page,
        params.limit,
        params.searchKeyword,
        params.joinStatus,
      ),
    });

    return administrators;
  };

  const getResidentByEmail = async (email: string): Promise<ResidentView> => {
    const notJoidedResidentUser = await userQueryRepo.findNotJoinedResidentByEmail(email);

    if (!notJoidedResidentUser) {
      throw BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    return notJoidedResidentUser;
  };

  const getResidentById = async (dto: GetResidentReqDto): Promise<ResidentView> => {
    const notJoidedResidentUser = await userQueryRepo.findResidentById(dto.id);

    if (!notJoidedResidentUser) {
      throw BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    return notJoidedResidentUser;
  };

  const getResidents = async (dto: GetResidentsReqDto): Promise<ResidentsView> => {
    const residentsUser = await userQueryRepo.findResidents(dto);
    return residentsUser;
  };

  const getResidentAccounts = async (
    dto: GetResidentAccountsReqDto,
  ): Promise<ResidentAccountView | null> => {
    const { key, lock } = redisKeys.residentAccounts(dto);
    const residentAccountsUser = await redisLocker.doWork({
      key,
      lockKey: lock,
      // cacheTtlSeconds: 30,
      // lockTtlSeconds: 3,
      work: () => userQueryRepo.findResidentAccounts(dto),
    });

    if (residentAccountsUser === null) {
      BusinessException({
        type: BusinessExceptionType.TEMPORARY_UNAVAILABLE,
      });
    }

    // 캐시 안한 로직
    // const residentAccountsUser =userQueryRepo.findResidentAccounts(dto)
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
