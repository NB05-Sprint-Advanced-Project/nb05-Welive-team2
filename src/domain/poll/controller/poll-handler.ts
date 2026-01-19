import { Middlewares } from '../../../shared/interface/i-middlewares';
import { validate } from '../../../utils/controller-util';
import {
  getPollReqParamsSchema,
  getAllPollsReqParamsSchema,
  createPollReqBodySchema,
  updatePollReqParamsSchema,
  updatePollReqBodySchema,
  voteReqParamsSchema,
} from '../dto/poll-request';
import { PollCommandService } from '../service/poll-command';
import { PollQueryService } from '../service/poll-query';
import { Request, Response } from 'express';

export const createPollHandler = (
  middlewares: Middlewares,
  pollQueryService: PollQueryService,
  pollCommandService: PollCommandService,
) => {
  const getPoll = async (req: Request, res: Response) => {
    const userId = req.userId as string;
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
    const userId = req.userId as string;
    const body = validate(createPollReqBodySchema, req.body);
    const poll = await pollCommandService.createPoll({ ...body }, userId);
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
    const userId = req.userId as string;

    await pollCommandService.vote({ ...params, userId });
    return res.json();
  };

  const cancle = async (req: Request, res: Response) => {
    const params = validate(voteReqParamsSchema, req.params);
    const userId = req.userId as string;

    await pollCommandService.cancle({ ...params, userId });
  };

  return {
    getPoll,
    getAllPolls,
    createPoll,
    updatePoll,
    deletePoll,
    vote,
    cancle,
  };
};

export type PollHandler = ReturnType<typeof createPollHandler>;
