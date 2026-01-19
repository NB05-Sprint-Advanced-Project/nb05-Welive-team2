import { Middlewares } from '../../shared/interface/i-middlewares';
import { catchHandler, validate } from '../../utils/controller-util';
import {
  createResidentUserSchema,
  deleteResidentSchema,
  getResidentSchema,
  getResidentsSchema,
  updateResidentSchema,
} from './dto/resident-user-response';
import { UserCommandService } from './service/user-command';
import { UserQueryService } from './service/user-query';
import express, { Request, Response } from 'express';

export const createResidentController = (
  middlewares: Middlewares,
  userCommandService: UserCommandService,
  userQueryService: UserQueryService,
) => {
  const path: string = '/api/v2/residents';
  const router = express.Router();

  const createResident = async (req: Request, res: Response) => {
    const userId = '';

    const reqDto = validate(createResidentUserSchema, {
      ...req.body,
      //userId: req.userId -> 인증된 유저 페이로드
    });
    await userCommandService.createResident(reqDto);

    return res.json(await userQueryService.getResidentByEmail(reqDto.email, reqDto.userId));
  };

  const getResidents = async (req: Request, res: Response) => {
    const reqDto = validate(getResidentsSchema, {
      ...req.query,
      //userId: req.userId
    });

    return res.json(userQueryService.getResidents(reqDto));
  };

  const getResident = async (req: Request, res: Response) => {
    const reqDto = validate(getResidentSchema, {
      ...req.params,
      // userId: req.userId
    });

    return res.json(await userQueryService.getResidentById(reqDto));
  };

  const updateResident = async (req: Request, res: Response) => {
    const reqDto = validate(updateResidentSchema, {
      ...req.body,
      ...req.params,
    });
    await userCommandService.updateResident(reqDto);

    return res.sendStatus(204);
  };

  const deleteResident = async (req: Request, res: Response) => {
    const reqDto = validate(deleteResidentSchema, req.params);
    await userCommandService.deleteResident(reqDto);

    return res.sendStatus(204);
  };

  router.post('/', catchHandler(createResident));
  router.get('/', catchHandler(getResidents));
  router.get('/:id', catchHandler(getResident));
  router.patch('/:id', catchHandler(updateResident));
  router.delete('/:id', catchHandler(deleteResident));
  router.get('/file/template');
  router.post('/file/import');
  router.get('/file/export');
};
