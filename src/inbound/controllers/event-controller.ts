import { NoticeCommandService } from '../../application/command/services/notice-command-service';
import { NoticeQueryService } from '../../application/query/services/notice-query-service';
import { Middlewares } from '../i-middelwares';
import express, { Request, Response, NextFunction } from 'express';
import { validate } from './controller-util';
import { getEventsReqParamsSchema } from '../requests/event-request';

export const createEventController = (
  middlewares: Middlewares,
  noticeQueryService: NoticeQueryService,
) => {
  const path: string = '/events';
  const router = express.Router();

  // const getEvents = async (req: Request, res: Response) => {
  //   const params = validate(getEventsReqParamsSchema, req.params);
  //   const events = await noticeQueryService.getEvents()
  // };
};
