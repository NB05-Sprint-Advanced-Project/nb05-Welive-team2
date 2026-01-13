import express, { Request, Response, NextFunction } from 'express';
import { Middlewares } from '../i-middelwares';
import { catchHandler, validate } from './controller-util';
import { UserQueryService } from '../../application/query/services/user-query-service';
import {
  approveAdminBodySchema,
  createAdminBodySchema,
  createSuperAdminBodySchema,
  updateAdminBodySchema,
  viewAdministratorQuerySchema,
} from '../requests/user-request';
import { UserCommandService } from '../../application/command/services/user-command-service';

export const createUserController = (
  middlewares: Middlewares,
  userQueryService: UserQueryService,
  userCommandService: UserCommandService,
) => {
  const path: string = '/api/v2/users';
  const router = express.Router();

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
  router.get('/admins', catchHandler(getAdministrators));
  router.put('/admins/:id', catchHandler(updateAdmin));
  router.patch('/admins/join-status', catchHandler(approveAllAdmins));
  router.patch('/admins/:id/join-status', catchHandler(approveAdmin));

  return { path, router };
};

export type UserController = ReturnType<typeof createUserController>;
