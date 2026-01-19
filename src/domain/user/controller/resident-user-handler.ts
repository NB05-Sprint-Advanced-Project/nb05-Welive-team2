import { Middlewares } from '../../../shared/interface/i-middlewares';
import { validate } from '../../../utils/controller-util';
import {
  createResidentUserSchema,
  getResidentsSchema,
  getResidentSchema,
  updateResidentSchema,
  deleteResidentSchema,
} from '../dto/resident-user-response';
import { UserCommandService } from '../service/user-command';
import { UserQueryService } from '../service/user-query';
import { Request, Response } from 'express';

export const createResidentUserHandlers = (
  userCommandService: UserCommandService,
  userQueryService: UserQueryService,
) => {
  const createResident = async (req: Request, res: Response) => {
    const reqDto = validate(createResidentUserSchema, {
      ...req.body,
      userId: req.userId,
    });
    await userCommandService.createResident(reqDto);

    return res.json(await userQueryService.getResidentByEmail(reqDto.email, reqDto.userId));
  };

  const getResidents = async (req: Request, res: Response) => {
    const reqDto = validate(getResidentsSchema, {
      ...req.query,
      userId: req.userId,
    });

    return res.json(await userQueryService.getResidents(reqDto));
  };

  const getResident = async (req: Request, res: Response) => {
    const reqDto = validate(getResidentSchema, {
      ...req.params,
      userId: req.userId,
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

  return {
    createResident,
    getResidents,
    getResident,
    updateResident,
    deleteResident,
  };
};

export type ResidentUserHandlers = ReturnType<typeof createResidentUserHandlers>;
