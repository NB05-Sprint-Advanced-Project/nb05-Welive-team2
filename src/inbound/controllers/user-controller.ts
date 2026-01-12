import express, { Request, Response, NextFunction } from 'express';
import { Middlewares } from '../i-middelwares';
import { catchHandler, validate } from './controller-util';
import { UserQueryService } from '../../application/query/services/user-query-service';
import { viewAdministratorQuerySchema } from '../requests/user-request';

export const createUserController = (
  middlewares: Middlewares,
  userQueryService: UserQueryService,
) => {
  const path: string = '/users';
  const router = express.Router();

  const getAdministrators = async (req: Request, res: Response) => {
    const query = validate(viewAdministratorQuerySchema, req.query);
    const admins = await userQueryService.getAdministrators(query);
    return res.json(admins);
  };

  router.get('/admins', catchHandler(getAdministrators));

  return { path, router };
};

export type UserController = ReturnType<typeof createUserController>;
