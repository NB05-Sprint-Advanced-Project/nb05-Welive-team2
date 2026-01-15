import { Middlewares } from '../../../shared/interface/i-middlewares';
import { NoticeQueryService } from '../service/notice-query';
import express, { Request, Response, NextFunction } from 'express';

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
