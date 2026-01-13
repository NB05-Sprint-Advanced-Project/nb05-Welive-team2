import express, { Request, Response, NextFunction } from 'express';
import { PollCommandService } from '../../application/command/services/poll-command-service';
import { PollQueryService } from '../../application/query/services/poll-query-service';
import { IUtils } from '../../shared/i-utils';
import { Middlewares } from '../i-middelwares';
import { catchHandler, validate } from './controller-util';
import {
  createPollReqBodySchema,
  getAllPollsReqParamsSchema,
  getPollReqParamsSchema,
  updatePollReqBodySchema,
  updatePollReqParamsSchema,
  voteReqParamsSchema,
} from '../requests/poll-request';

export const createPollController = (
  middlewares: Middlewares,
  pollQueryService: PollQueryService,
  pollCommandService: PollCommandService,
  utils: IUtils,
) => {
  const path: string = '/polls';
  const router = express.Router();

  const getPoll = async (req: Request, res: Response) => {
    const userId = 'test'; // 임시로 추가
    const params = validate(getPollReqParamsSchema, req.params);
    const poll = await pollQueryService.getPoll(params.pollId, userId);
    return res.json(poll);
  };

  const getAllPolls = async (req: Request, res: Response) => {
    const params = validate(getAllPollsReqParamsSchema, req.params);
    const polls = await pollQueryService.getAllPolls({ ...params });
    return res.json(polls);
  };

  const createPoll = async (req: Request, res: Response) => {
    const body = validate(createPollReqBodySchema, req.body);
    const poll = await pollCommandService.createPoll({ ...body });
    return res.json(poll);
  };

  const updatePoll = async (req: Request, res: Response) => {
    const params = validate(updatePollReqParamsSchema, req.params);
    const body = validate(updatePollReqBodySchema, req.body);
    await pollCommandService.updatePoll({ ...body, pollId: params.pollId });
    return res.json();
  };

  const deletePoll = async (req: Request, res: Response) => {
    const params = validate(updatePollReqParamsSchema, req.params);
    await pollCommandService.deletePoll({ pollId: params.pollId });
    return res.json();
  };

  const vote = async (req: Request, res: Response) => {
    const params = validate(voteReqParamsSchema, req.params);
    const userId = 'test'; // temp
    await pollCommandService.vote({ ...params, userId });
    return res.json();
  };

  const cancle = async (req: Request, res: Response) => {
    const params = validate(voteReqParamsSchema, req.params);
    const userId = 'temp'; // temp
    await pollCommandService.cancle({ ...params, userId });
  };

  router.get('/:pollId', catchHandler(getPoll));

  router.get('/', catchHandler(getAllPolls));

  router.post('/', catchHandler(createPoll));

  router.patch('/:pollId', catchHandler(updatePoll));

  router.delete('/:pollId', catchHandler(deletePoll));

  router.post('/:pollId/options/:optionId/vote', catchHandler(vote));

  router.delete('/:pollId/options/:optionId/vote', catchHandler(vote));

  return { path, router };
};

export type PollController = ReturnType<typeof createPollController>;
