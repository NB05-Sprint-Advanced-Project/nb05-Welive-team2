import { Router } from 'express';
import path from 'path';
import { catchHandler } from '../../../utils/controller-util';
import { ResidentUserHandlers } from './resident-user-handler';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerResidentUserRoutes = (
  router: Router,
  handlers: ResidentUserHandlers,
  middlewares: Middlewares,
) => {
  router.post(
    '/',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.createResident),
  );
  router.get('/', catchHandler(middlewares.auth.authenticate), catchHandler(handlers.getResidents));
  router.get(
    '/:id',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.getResident),
  );
  router.patch('/:id', catchHandler(handlers.updateResident));
  router.delete('/:id', catchHandler(handlers.deleteResident));
  // router.get('/file/template');
  // router.post('/file/import');
  // router.get('/file/export');
};
