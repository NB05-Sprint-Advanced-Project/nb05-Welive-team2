import express, { Request, Response } from 'express';
import { catchHandler, validate } from '../../utils/controller-util';
import { UserQueryService } from './service/user-query';
import {
  updateAdminjoinedStatusesSchema,
  createAdminBodySchema,
  createSuperAdminBodySchema,
  updateAdminSchema,
  signUpResidentAccountSchema,
  updateAvatarUrlSchema,
  updatePasswordSchema,
  viewAdministratorQuerySchema,
  updateAdminjoinedStatusSchema,
} from './dto/user-request';
import { UserCommandService } from './service/user-command';
import { Middlewares } from '../../shared/interface/i-middlewares';

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
    const reqDto = validate(createSuperAdminBodySchema, req.body);
    const superAdmin = await userCommandService.createSuperAdmin(reqDto);
    return res.status(204);
  };

  // 관리자
  const createAdmin = async (req: Request, res: Response) => {
    const reqDto = validate(createAdminBodySchema, req.body);
    await userCommandService.createAdmin(reqDto);
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
    const reqDto = validate(viewAdministratorQuerySchema, req.query);
    const admins = await userQueryService.getAdministrators(reqDto);
    return res.status(200).json(admins);
  };

  const updateAdmin = async (req: Request, res: Response) => {
    const reqDto = validate(updateAdminSchema, {
      ...req.body,
      ...req.params,
    });
    await userCommandService.updateAdmin(reqDto);
    return res.status(204);
  };

  const updateAdminJoinedStatues = async (req: Request, res: Response) => {
    const reqDto = validate(updateAdminjoinedStatusesSchema, req.body);
    await userCommandService.updateAdminJoinedStatuses(reqDto);
    return res.status(204);
  };
  const updateAdminJoinedStatus = async (req: Request, res: Response) => {
    const reqDto = validate(updateAdminjoinedStatusSchema, {
      ...req.body,
      ...req.params,
    });
    await userCommandService.updateAdminJoinedStatus(reqDto);
    return res.status(204);
  };

  router.post('/super-admins', catchHandler(createSuperAdmin));
  router.post('/admins', catchHandler(createAdmin));

  // // 입주민 계정
  // const signUpResidentAccount = async (req: Request, res: Response) => {
  //   const reqDto = validate(signUpResidentAccountSchema, req.body);
  //   await userCommandService.createResidentAccount(reqDto);

  //   return res.sendStatus(204);
  // };

  // const getResidentAccounts = async (req: Request, res: Response) => {
  //   const reqDto = validate(, req.body);
  //   const residentAccount = await userQueryService.
  // };

  //다건
  // const updateResidentAccountJoinStatuses = async (req: Request, res: Response) => {
  //   const reqDto = validate(updateResidentAccountJoinedStatusesSchema, req.body);
  //   await userCommandService.updateResidentAccountJoinStatuses(reqDto);

  //   return res.sendStatus(204);
  // };

  // // 단건
  // const updateResidentAccountJoinStatus = async (req: Request, res: Response) => {
  //   const reqDto = validate(updateResidentAccountJoinedStatusSchema, req.body);
  //   await userCommandService.updateResidentAccountJoinStatus(reqDto);

  //   return res.sendStatus(204);
  // };

  // const deleteResidentAccounts = async (req: Request, res: Response) => {
  //   await userCommandService.deleteResidentAccounts();

  //   return res.sendStatus(204);
  // };

  // // routers
  // // 공통 routers
  // router.patch(
  //   '/me/avatar',
  //   //catchHandler(middlewares.multer.uploadS3),
  //   catchHandler(updateAvatarUrl),
  // );
  // router.patch('me/password', catchHandler(updatePassword));

  // 관리자 계정
  router.get('/admins', catchHandler(getAdministrators));
  router.put('/admins/:id', catchHandler(updateAdmin));
  router.patch('/admins/join-status', catchHandler(updateAdminJoinedStatues));
  router.patch('/admins/:id/join-status', catchHandler(updateAdminJoinedStatus));

  // // 입주민 계정
  // router.post('/residents', catchHandler(signUpResidentAccount));
  // router.get('/residents', catchHandler(getResidentAccounts));
  // router.patch('/residents/join-status', catchHandler(updateResidentAccountJoinStatuses));
  // router.patch('/residents/:id/join-status', catchHandler(updateResidentAccountJoinStatus));
  // router.delete('/residents/rejected', catchHandler(deleteResidentAccounts));

  return { path, router };
};

export type UserController = ReturnType<typeof createUserController>;
