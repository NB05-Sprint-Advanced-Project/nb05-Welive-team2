import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import {
  ExportResidentsReqDto,
  GetResidentReqDto,
  GetResidentsReqDto,
} from '../dto/resident-user-response';
import { GetResidentAccountsReqDto } from '../dto/user-request';
import {
  ResidentAccountView,
  ResidentsView,
  ResidentView,
  ResidentViewForCSV,
} from '../dto/view/resident';
import { Status } from '../entity/base-user';
import { IUserQueryRepo } from '../interface/i-user-query-repo';
import { IRedisLocker } from '../../../shared/interface/i-redis-locker';
import { Readable } from 'stream';
import { redisKeys } from '../../../shared/utils/redis-keys';
import { IFileManager } from '../../../shared/interface/i-file-manager';

/**
 *  전제 - 한 아파트에 관리자가 1명인 프로젝트
 *  하지만 성능 부하 테스트 공부를 위해서 동시에 여러 명이 요청 올 수 있다고 가정했음(1초에 최대 20000명 요청)
 * getAdministrators, getResidents, getResidentAccount로 성능 테스트 해봄
 */
export const createUserQueryService = (
  userQueryRepo: IUserQueryRepo,
  redisLocker: IRedisLocker,
  fileManager: IFileManager,
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

  /**
   * 조회 디폴트 값만 캐싱을 하고 나머지 조회(필터 조회)는 바로 DB 조회
   * @ throws EMPORARY_UNAVAILABLE
   */
  const getResidents = async (dto: GetResidentsReqDto): Promise<ResidentsView> => {
    const { page, limit, searchKeyword, building, unit, isHouseholder, isRegistered } = dto;

    let residentsUser: ResidentsView | null = null;

    const isDefaultFilter =
      limit === 10 &&
      page === 1 &&
      searchKeyword === undefined &&
      building === undefined &&
      unit === undefined &&
      isHouseholder === undefined &&
      isRegistered === undefined;

    if (isDefaultFilter) {
      const { key, lock } = redisKeys.residents();
      residentsUser = await redisLocker.doWork({
        key,
        lockKey: lock,
        cacheTtlSeconds: 30,
        lockTtlSeconds: 3,
        work: () => userQueryRepo.findResidents(dto),
      });
    } else {
      residentsUser = await userQueryRepo.findResidents(dto);
    }

    if (!residentsUser) {
      throw BusinessException({
        type: BusinessExceptionType.TEMPORARY_UNAVAILABLE,
      });
    }

    return residentsUser;
  };

  /**
   * 조회 디폴트 값만 캐싱을 하고 나머지 조회(필터 조회)는 바로 DB 조회
   * @ throws EMPORARY_UNAVAILABLE
   */
  const getResidentAccounts = async (
    dto: GetResidentAccountsReqDto,
  ): Promise<ResidentAccountView> => {
    const { page, limit, searchKeyword, joinStatus, building, unit } = dto;

    let residentAccountsUser: ResidentAccountView | null = null;

    const isDefaultFilter =
      limit === 10 &&
      page === 1 &&
      searchKeyword === undefined &&
      building === undefined &&
      unit === undefined &&
      joinStatus === undefined;

    if (isDefaultFilter) {
      const { key, lock } = redisKeys.residentAccounts();
      residentAccountsUser = await redisLocker.doWork({
        key,
        lockKey: lock,
        cacheTtlSeconds: 30,
        lockTtlSeconds: 3,
        work: () => userQueryRepo.findResidentAccounts(dto),
      });
    } else {
      residentAccountsUser = await userQueryRepo.findResidentAccounts(dto);
    }

    if (!residentAccountsUser) {
      throw BusinessException({
        type: BusinessExceptionType.TEMPORARY_UNAVAILABLE,
      });
    }

    return residentAccountsUser;
  };

  const exportResidentTemplate = async () => {
    const filePath = 'CSV-form/resident_upload_form.csv';
    const data = await fileManager.getFile(filePath);

    if (!data.body || typeof data.body !== 'string') {
      throw BusinessException({ type: BusinessExceptionType.NOT_CSV_FILE });
    }

    return {
      stream: Readable.from(data.body),
      contentType: data.contentType ?? 'text/csv',
      contentLength: data.contentLength,
      fileName: 'resident_bulk_template.csv',
    };
  };

  const exportResidents = async (dto: ExportResidentsReqDto) => {
    const residents = await userQueryRepo.findResidentsForExport(dto);

    if (residents.length === 0) {
      throw BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    const stream = new Readable({
      read() {},
    });

    stream.push(`"동","호수","이름","연락처","이메일","세대주여부"\n`);

    const toResidentCsvLine = (resident: ResidentViewForCSV): string => {
      return [
        resident.building,
        resident.unit,
        `"${resident.name}"`,
        `"${resident.contact}"`,
        `"${resident.email}"`,
        resident.isHouseholder,
      ].join(',');
    };

    for (const resident of residents) {
      stream.push(toResidentCsvLine(resident) + '\n');
    }

    stream.push(null);

    return {
      stream,
      contentType: 'text/csv; charset=utf-8',
      fileName: 'residents.csv',
    };
  };

  return {
    getAdministrators,
    getResidentByEmail,
    getResidentById,
    getResidents,
    getResidentAccounts,
    exportResidentTemplate,
    exportResidents,
  };
};

export type UserQueryService = ReturnType<typeof createUserQueryService>;
