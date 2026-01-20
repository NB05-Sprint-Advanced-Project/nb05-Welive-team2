import { Router } from 'express';
import { PollHandler } from './poll-handler';
import { catchHandler } from '../../../utils/controller-util';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerPollRoutes = (
  router: Router,
  handler: PollHandler,
  middlewares: Middlewares,
) => {
  router.get(
    '/:pollId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handler.getPoll),
  );

  router.get('/', catchHandler(middlewares.auth.authenticate), catchHandler(handler.getAllPolls));

  router.post('/', catchHandler(middlewares.auth.authenticate), catchHandler(handler.createPoll));

  router.patch(
    '/:pollId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handler.updatePoll),
  );

  router.delete(
    '/:pollId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handler.deletePoll),
  );

  router.post(
    '/:pollId/options/:optionId/vote',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handler.vote),
  );

  router.delete(
    '/:pollId/options/:optionId/vote',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handler.cancle),
  );
};
