import { Middlewares } from '../../../shared/interface/i-middlewares';
import { validate } from '../../../utils/controller-util';
import {
  createSuperAdminBodySchema,
  createAdminBodySchema,
  updateAvatarUrlSchema,
  updatePasswordSchema,
  viewAdministratorQuerySchema,
  updateAdminBodySchema,
  approveAdminBodySchema,
  signUpResidentAccountSchema,
} from '../dto/user-request';
import { UserCommandService } from '../service/user-command';
import { UserQueryService } from '../service/user-query';
import { Request, Response } from 'express';

export const createUserHandlers = (
  middlewares: Middlewares,
  userCommandService: UserCommandService,
  userQueryService: UserQueryService,
) => {
  // controllers

  // 슈퍼 관리자
  const createSuperAdmin = async (req: Request, res: Response) => {
    const body = validate(createSuperAdminBodySchema, req.body);
    const superAdmin = await userCommandService.createSuperAdmin(body);
    return res.status(204).send();
  };

  // 관리자
  const createAdmin = async (req: Request, res: Response) => {
    const body = validate(createAdminBodySchema, req.body);
    await userCommandService.createAdmin(body);
    return res.status(204).send();
  };

  // 공통 controllers
  const updateAvatarUrl = async (req: Request, res: Response) => {
    const reqDto = validate(updateAvatarUrlSchema, req.body);
    await userCommandService.updateAvatarUrl(reqDto);

    return res.sendStatus(204);
  };

  const updatePassword = async (req: Request, res: Response) => {
    const reqDto = validate(updatePasswordSchema, req.body);
    await userCommandService.updatePassword(reqDto);

    return res.sendStatus(204);
  };

  // 관리자 계정
  const getAdministrators = async (req: Request, res: Response) => {
    const query = validate(viewAdministratorQuerySchema, req.query);
    const admins = await userQueryService.getAdministrators(query);
    return res.status(200).json(admins);
  };

  const updateAdmin = async (req: Request, res: Response) => {
    const body = validate(updateAdminBodySchema, req.body);
    const updatedAdmin = await userCommandService.updateAdmin(body);
    return res.status(204).send();
  };

  const approveAllAdmins = async (req: Request, res: Response) => {
    const body = validate(approveAdminBodySchema, req.body);
    // const result = await userCommandService.approveAllAdmins(body.joinStatus);
    return res.status(204);
  };
  const approveAdmin = async (req: Request, res: Response) => {
    const body = validate(approveAdminBodySchema, req.body);
    // const result = await userCommandService.approveAdmin(body.joinStatus, req.params.id);
    return res.status(204);
  };

  // 입주민 계정
  const signUpResidentAccount = async (req: Request, res: Response) => {
    const reqDto = validate(signUpResidentAccountSchema, req.body);
    await userCommandService.createResidentAccount(reqDto);

    return res.sendStatus(204);
  };

  const getResidentAccounts = async (req: Request, res: Response) => {
    // const reqDto = validate(, req.body);
    // const residentAccount = await userQueryService.
  };

  return {
    createSuperAdmin,
    createAdmin,
    updateAvatarUrl,
    updatePassword,
    getAdministrators,
    updateAdmin,
    approveAllAdmins,
    approveAdmin,
    signUpResidentAccount,
    getResidentAccounts,
  };
};

export type UserHandlers = ReturnType<typeof createUserHandlers>;
