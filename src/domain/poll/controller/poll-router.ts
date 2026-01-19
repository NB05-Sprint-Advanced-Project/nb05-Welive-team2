import { Router } from 'express';
import { PollHandler } from './poll-handler';
import { catchHandler } from '../../../utils/controller-util';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerPollRoutes = (
  router: Router,
  handler: PollHandler,
  middlewares: Middlewares,
) => {
  const auth = middlewares.auth;

  router.get('/:pollId', auth, catchHandler(handler.getPoll));

  router.get('/', auth, catchHandler(handler.getAllPolls));

  router.post('/', auth, catchHandler(handler.createPoll));

  router.patch('/:pollId', auth, catchHandler(handler.updatePoll));

  router.delete('/:pollId', auth, catchHandler(handler.deletePoll));

  router.post('/:pollId/options/:optionId/vote', auth, catchHandler(handler.vote));

  router.delete('/:pollId/options/:optionId/vote', auth, catchHandler(handler.vote));
};
