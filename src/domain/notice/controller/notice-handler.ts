import { Middlewares } from '../../../shared/interface/i-middlewares';
import { validate } from '../../../utils/controller-util';
import { getEventsReqParamsSchema } from '../dto/event-request';
import {
  getNoticeReqParamsSchema,
  getAllNoticesReqParamsSchema,
  createNoticeReqBodySchema,
  updateNoticeReqParamsSchema,
  updateNoticeReqBodySchema,
  deleteNoticeReqParamsSchema,
} from '../dto/notice-request';
import { NoticeCommandService } from '../service/notice-command';
import { NoticeQueryService } from '../service/notice-query';
import { Request, Response } from 'express';

export const createNoticeHandler = (
  middlewares: Middlewares,
  noticeQueryService: NoticeQueryService,
  noticeCommandService: NoticeCommandService,
) => {
  const getNotice = async (req: Request, res: Response) => {
    const params = validate(getNoticeReqParamsSchema, req.params);
    const notice = await noticeQueryService.getNotice(params.noticeId);
    return res.json(notice);
  };

  const getAllNotices = async (req: Request, res: Response) => {
    const query = validate(getAllNoticesReqParamsSchema, req.query);
    const userId = req.user.userId;
    const notices = await noticeQueryService.getAllNotices(userId, { ...query });
    return res.json(notices);
  };

  const createNotice = async (req: Request, res: Response) => {
    const body = validate(createNoticeReqBodySchema, req.body);
    const userId = req.userId as string;
    const notice = await noticeCommandService.createNotice({ ...body }, userId);
    return res.status(201).json(notice);
  };

  const updateNotice = async (req: Request, res: Response) => {
    const params = validate(updateNoticeReqParamsSchema, req.params);
    const body = validate(updateNoticeReqBodySchema, req.body);
    await noticeCommandService.updateNotice({ ...body, noticeId: params.noticeId });
    return res.status(200).json();
  };

  const deleteNotice = async (req: Request, res: Response) => {
    const params = validate(deleteNoticeReqParamsSchema, req.params);
    await noticeCommandService.deleteNotice({ noticeId: params.noticeId });
    return res.status(204).json();
  };

  const getEvents = async (req: Request, res: Response) => {
    const params = validate(getEventsReqParamsSchema, req.query);
    const events = await noticeQueryService.getEvents({ ...params });
    return res.json(events);
  };

  return {
    getNotice,
    getAllNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    getEvents,
  };
};

export type NoticeHandler = ReturnType<typeof createNoticeHandler>;
