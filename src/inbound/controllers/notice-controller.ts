import express, { Request, Response, NextFunction } from 'express';
import { Middlewares } from '../i-middelwares';
import { NoticeCommandService } from '../../application/command/services/notice-command-service';
import { NoticeQueryService } from '../../application/query/services/notice-query-service';
import { catchHandler, validate } from './controller-util';
import {
  createNoticeReqBodySchema,
  deleteNoticeReqParamsSchema,
  getAllNoticesReqParamsSchema,
  getNoticeReqParamsSchema,
  updateNoticeReqBodySchema,
  updateNoticeReqParamsSchema,
} from '../requests/notice-request';

export const createNoticeController = (
  middlewares: Middlewares,
  noticeQueryService: NoticeQueryService,
  noticeCommandService: NoticeCommandService,
) => {
  const path: string = '/notices';
  const router = express.Router();

  const getNotice = async (req: Request, res: Response) => {
    const params = validate(getNoticeReqParamsSchema, req.params);
    const notice = await noticeQueryService.getNotice(params.noticeId);
    return res.json(notice);
  };

  const getAllNotices = async (req: Request, res: Response) => {
    const params = validate(getAllNoticesReqParamsSchema, req.params);
    const notices = await noticeQueryService.getAllNotices({ ...params });
    return res.json(notices);
  };

  const createNotice = async (req: Request, res: Response) => {
    const body = validate(createNoticeReqBodySchema, req.body);
    const notice = await noticeCommandService.createNotice({ ...body });
    return res.json(notice);
  };

  const updateNotice = async (req: Request, res: Response) => {
    const params = validate(updateNoticeReqParamsSchema, req.params);
    const body = validate(updateNoticeReqBodySchema, req.body);
    await noticeCommandService.updateNotice({ ...body, noticeId: params.noticeId });
    return res.json();
  };

  const deleteNotice = async (req: Request, res: Response) => {
    const params = validate(deleteNoticeReqParamsSchema, req.params);
    await noticeCommandService.deleteNotice({ noticeId: params.noticeId });
    return res.json();
  };

  router.get('/:noticeId', catchHandler(getNotice));

  router.get('/', catchHandler(getAllNotices));

  router.post('/', catchHandler(createNotice));

  router.patch('/:noticeId', catchHandler(updateNotice));

  router.delete('/:noticeId', catchHandler(deleteNotice));

  return { path, router };
};

export type NoticeController = ReturnType<typeof createNoticeController>;
