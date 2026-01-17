import { Middlewares } from '../../../shared/interface/i-middlewares';
import { validate } from '../../../utils/controller-util';
import {
  createSuperAdminSchema,
  createAdminSchema,
  updateAvatarUrlSchema,
  updatePasswordSchema,
  viewAdministratorSchema,
  signUpResidentAccountSchema,
  updateAdminSchema,
  deleteAdminSchema,
  updateAdminsJoinStatusesSchema,
  updateAdminJoinStatusSchema,
  getResidentAccountsSchema,
  updateResidentAccountJoinedStatusesSchema,
  updateResidentAccountJoinedStatusSchema,
} from '../dto/user-request';
import { UserCommandService } from '../service/user-command';
import { UserQueryService } from '../service/user-query';
import { Request, Response } from 'express';

export const createUserHandlers = (
  middlewares: Middlewares,
  userCommandService: UserCommandService,
  userQueryService: UserQueryService,
) => {
  // 슈퍼 관리자
  const createSuperAdmin = async (req: Request, res: Response) => {
    const dto = validate(createSuperAdminSchema, req.body);
    const superAdmin = await userCommandService.createSuperAdmin(dto);
    return res.status(204).send();
  };

  // 관리자
  const createAdmin = async (req: Request, res: Response) => {
    const dto = validate(createAdminSchema, req.body);
    await userCommandService.createAdmin(dto);
    return res.status(204).send();
  };

  const getAdministrators = async (req: Request, res: Response) => {
    const dto = validate(viewAdministratorSchema, req.query);
    const admins = await userQueryService.getAdministrators(dto);
    return res.status(200).json(admins);
  };

  const updateAdmin = async (req: Request, res: Response) => {
    const dto = validate(updateAdminSchema, {
      ...req.body,
      ...req.params,
    });
    const updatedAdmin = await userCommandService.updateAdmin(dto);
    return res.status(204).send();
  };

  const updateAdminsJoinStatuses = async (req: Request, res: Response) => {
    const dto = validate(updateAdminsJoinStatusesSchema, req.body);
    const result = await userCommandService.updateAdminJoinedStatuses(dto);
    return res.status(204).send();
  };

  const updateAdminJoinStatus = async (req: Request, res: Response) => {
    const dto = validate(updateAdminJoinStatusSchema, {
      ...req.body,
      ...req.params,
    });
    const result = await userCommandService.updateAdminJoinedStatus(dto);
    return res.status(204).send();
  };

  const deleteAdmin = async (req: Request, res: Response) => {
    const dto = validate(deleteAdminSchema, req.params);
    await userCommandService.deleteAdmin(dto);
    return res.status(204).send();
  };

  const deleteRejectedAdmins = async (req: Request, res: Response) => {
    await userCommandService.deleteRejectedAdmins();
    return res.status(204).send();
  };

  // 공통 controllers
  const updateAvatarUrl = async (req: Request, res: Response) => {
    const dto = validate(updateAvatarUrlSchema, req.body);
    await userCommandService.updateAvatarUrl(dto);
    return res.sendStatus(204);
  };

  const updatePassword = async (req: Request, res: Response) => {
    const dto = validate(updatePasswordSchema, req.body);
    await userCommandService.updatePassword(dto);
    return res.sendStatus(204);
  };

  // 입주민 계정
  const signUpResidentAccount = async (req: Request, res: Response) => {
    const reqDto = validate(signUpResidentAccountSchema, req.body);
    await userCommandService.createResidentAccount(reqDto);

    return res.sendStatus(204);
  };

  const getResidentAccounts = async (req: Request, res: Response) => {
    const reqDto = validate(getResidentAccountsSchema, req.body);

    return res.json(await userQueryService.getResidentAccounts(reqDto));
  };

  //다건
  const updateResidentAccountJoinStatuses = async (req: Request, res: Response) => {
    const reqDto = validate(updateResidentAccountJoinedStatusesSchema, req.body);
    await userCommandService.updateResidentAccountJoinStatuses(reqDto);

    return res.sendStatus(204);
  };

  // 단건
  const updateResidentAccountJoinStatus = async (req: Request, res: Response) => {
    const reqDto = validate(updateResidentAccountJoinedStatusSchema, req.body);
    await userCommandService.updateResidentAccountJoinStatus(reqDto);

    return res.sendStatus(204);
  };

  const deleteResidentAccounts = async (req: Request, res: Response) => {
    await userCommandService.deleteResidentAccounts();

    return res.sendStatus(204);
  };

  return {
    createSuperAdmin,
    createAdmin,
    updateAvatarUrl,
    updatePassword,
    getAdministrators,
    updateAdmin,
    updateAdminsJoinStatuses,
    updateAdminJoinStatus,
    deleteAdmin,
    deleteRejectedAdmins,
    signUpResidentAccount,
    getResidentAccounts,
    updateResidentAccountJoinStatuses,
    updateResidentAccountJoinStatus,
    deleteResidentAccounts,
  };
};

export type UserHandlers = ReturnType<typeof createUserHandlers>;
