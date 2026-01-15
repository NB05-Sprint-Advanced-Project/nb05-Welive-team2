import express, { Request, Response, NextFunction } from 'express';
import { NoticeCommandService } from '../service/notice-command';
import { NoticeQueryService } from '../service/notice-query';
import { validate, catchHandler } from '../../../utils/controller-util';
import {
  getNoticeReqParamsSchema,
  getAllNoticesReqParamsSchema,
  createNoticeReqBodySchema,
  updateNoticeReqParamsSchema,
  updateNoticeReqBodySchema,
  deleteNoticeReqParamsSchema,
} from '../dto/notice-request';

export const createNoticeController = (
  middlewares: {
    globalError: (
      err: any,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => express.Response<any, Record<string, any>>;
    notFound: (req: Request, res: Response, next: NextFunction) => void;
  },
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
