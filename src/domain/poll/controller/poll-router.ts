import { Router } from 'express';
import { PollHandler } from './poll-handler';
import { catchHandler } from '../../../utils/controller-util';

export const registerPollRoutes = (router: Router, handler: PollHandler) => {
  router.get('/:pollId', catchHandler(handler.getPoll));

  router.get('/', catchHandler(handler.getAllPolls));

  router.post('/', catchHandler(handler.createPoll));

  router.patch('/:pollId', catchHandler(handler.updatePoll));

  router.delete('/:pollId', catchHandler(handler.deletePoll));

  router.post('/:pollId/options/:optionId/vote', catchHandler(handler.vote));

  router.delete('/:pollId/options/:optionId/vote', catchHandler(handler.vote));
};
