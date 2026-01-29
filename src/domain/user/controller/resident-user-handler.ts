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
import { parse } from 'csv-parse';

export const createResidentUserHandlers = (
  userCommandService: UserCommandService,
  userQueryService: UserQueryService,
) => {
  const countCsvRows = (buffer: Buffer) =>
    new Promise<number>((resolve, reject) => {
      let count = 0;
      parse(buffer, { columns: true, skip_empty_lines: true })
        .on('data', () => count++)
        .on('end', () => resolve(count))
        .on('error', reject);
    });

  const importResidentsFromCsv = async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'CSV 파일이 업로드되지 않았습니다.' });
    }

    let totalRows = 0;
    for (const file of files) {
      totalRows += await countCsvRows(file.buffer);
    }

    await userCommandService.importResidentsFromCsv(req.user.userId, files);

    return res.status(201).json({
      count: totalRows,
    });
  };

  const createResident = async (req: Request, res: Response) => {
    const reqDto = validate(createResidentUserSchema, req.body);
    await userCommandService.createResident(reqDto);

    return res.status(201).json(await userQueryService.getResidentByEmail(reqDto.email));
  };

  const getResidents = async (req: Request, res: Response) => {
    const reqDto = validate(getResidentsSchema, req.query);

    return res.json(await userQueryService.getResidents(reqDto));
  };

  const getResident = async (req: Request, res: Response) => {
    const reqDto = validate(getResidentSchema, req.params);

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
    importResidentsFromCsv,
    createResident,
    getResidents,
    getResident,
    updateResident,
    deleteResident,
  };
};

export type ResidentUserHandlers = ReturnType<typeof createResidentUserHandlers>;
