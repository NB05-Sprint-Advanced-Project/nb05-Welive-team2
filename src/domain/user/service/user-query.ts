import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { GetResidentReqDto, GetResidentsReqDto } from '../dto/resident-user-response';
import { GetResidentAccountsReqDto } from '../dto/user-request';
import { ResidentAccountView, ResidentsView, ResidentView } from '../dto/view/resident';
import { Status } from '../entity/base-user';
import { IUserQueryRepo } from '../interface/i-user-query-repo';
import { redisKeys } from '../../../utils/redis-keys';
import { IRedisLocker } from '../../../shared/interface/i-redis-locker';
/**
 *  전제 - 한 아파트에 관리자가 1명인 프로젝트
 *  하지만 성능 부하 테스트 공부를 위해서 동시에 여러 명이 요청 올 수 있다고 가정했음(1초에 최대 20000명 요청)
 * getAdministrators, getResidents, getResidentAccount로 성능 테스트 해봄
 */
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
    const residentUser = await userQueryRepo.findResidentById(dto.id);

    if (!residentUser) {
      throw BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    return residentUser;
  };

  const getResidents = async (dto: GetResidentsReqDto): Promise<ResidentsView> => {
    const { key, lock } = redisKeys.residents(dto);
    const residentsUser = await redisLocker.doWork({
      key,
      lockKey: lock,
      cacheTtlSeconds: 30,
      lockTtlSeconds: 3,
      work: () => userQueryRepo.findResidents(dto),
    });
    if (residentsUser === null) {
      throw BusinessException({
        type: BusinessExceptionType.TEMPORARY_UNAVAILABLE,
      });
    }
    // const residentsUser = userQueryRepo.findResidents(dto);
    return residentsUser;
  };

  const getResidentAccounts = async (
    dto: GetResidentAccountsReqDto,
  ): Promise<ResidentAccountView> => {
    const { key, lock } = redisKeys.residentAccounts(dto);
    const residentAccountsUser = await redisLocker.doWork({
      key,
      lockKey: lock,
      cacheTtlSeconds: 30,
      lockTtlSeconds: 3,
      work: () => userQueryRepo.findResidentAccounts(dto),
    });

    // 캐시 재시도까지도 실패한 요청
    if (residentAccountsUser === null) {
      throw BusinessException({
        type: BusinessExceptionType.TEMPORARY_UNAVAILABLE,
      });
    }

    // // 캐시 안한 로직
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
