import express, { Request, Response } from 'express';
import { Middlewares } from '../i-middelwares';
import { catchHandler, validate } from './controller-util';
import { UserQueryService } from '../../application/query/services/user-query-service';
import {
  approveAdminBodySchema,
  createAdminBodySchema,
  createSuperAdminBodySchema,
  updateAdminBodySchema,
  signUpResidentAccountSchema,
  updateAvatarUrlSchema,
  updatePasswordSchema,
  viewAdministratorQuerySchema,
  updateResidentAccountJoinedStatusesSchema,
  updateResidentAccountJoinedStatusSchema,
} from '../requests/user-request';
import { UserCommandService } from '../../application/command/services/user-command-service';

export const createUserController = (
  middlewares: Middlewares,
  userCommandService: UserCommandService,
  userQueryService: UserQueryService,
) => {
  const path: string = '/api/v2/users';
  const router = express.Router();
  // controllers

  // 슈퍼 관리자
  const createSuperAdmin = async (req: Request, res: Response) => {
    const body = validate(createSuperAdminBodySchema, req.body);
    const superAdmin = await userCommandService.createSuperAdmin(body);
    return res.status(204);
  };

  // 관리자
  const createAdmin = async (req: Request, res: Response) => {
    const body = validate(createAdminBodySchema, req.body);
    const admin = await userCommandService.createAdmin(body);
    return res.status(204);
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
    return res.status(204);
  };

  const approveAllAdmins = async (req: Request, res: Response) => {
    const body = validate(approveAdminBodySchema, req.body);
    const result = await userCommandService.approveAllAdmins(body.joinStatus);
    return res.status(204);
  };
  const approveAdmin = async (req: Request, res: Response) => {
    const body = validate(approveAdminBodySchema, req.body);
    const result = await userCommandService.approveAdmin(body.joinStatus, req.params.id);
    return res.status(204);
  };

  router.post('/super-admins', catchHandler(createSuperAdmin));
  router.post('/admins', catchHandler(createAdmin));

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

  // 다건
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

  // routers
  // 공통 routers
  router.patch(
    '/me/avatar',
    //catchHandler(middlewares.multer.uploadS3),
    catchHandler(updateAvatarUrl),
  );
  router.patch('me/password', catchHandler(updatePassword));

  // 관리자 계정
  router.get('/admins', catchHandler(getAdministrators));
  router.put('/admins/:id', catchHandler(updateAdmin));
  router.patch('/admins/join-status', catchHandler(approveAllAdmins));
  router.patch('/admins/:id/join-status', catchHandler(approveAdmin));

  // 입주민 계정
  router.post('/residents', catchHandler(signUpResidentAccount));
  router.get('/residents', catchHandler(getResidentAccounts));
  router.patch('/residents/join-status', catchHandler(updateResidentAccountJoinStatuses));
  router.patch('/residents/:id/join-status', catchHandler(updateResidentAccountJoinStatus));
  router.delete('/residents/rejected', catchHandler(deleteResidentAccounts));

  return { path, router };
};

export type UserController = ReturnType<typeof createUserController>;
