import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { GetResidentReqDto, GetResidentsReqDto } from '../dto/resident-response';
import { GetResidentAccountsReqDto } from '../dto/user-request';
import { ResidentAccountView, ResidentsView, ResidentView } from '../dto/view/resident';
import { Status } from '../entity/base-user';
import { IUserQueryRepo } from '../interface/i-user-query-repo';

export const createUserQueryService = (userQueryRepo: IUserQueryRepo) => {
  const getAdministrators = async (params: {
    page: number;
    limit: number;
    searchKeyword: string;
    joinStatus?: Status;
  }) => {
    const administrators = await userQueryRepo.findAllAdmins(
      params.page,
      params.limit,
      params.searchKeyword,
      params.joinStatus,
    );

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
