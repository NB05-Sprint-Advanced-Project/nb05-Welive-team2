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
  router.post('/', catchHandler(middlewares.auth.authAdmin), catchHandler(handlers.createResident));
  router.get('/', catchHandler(middlewares.auth.authAdmin), catchHandler(handlers.getResidents));
  router.get('/:id', catchHandler(middlewares.auth.authAdmin), catchHandler(handlers.getResident));
  router.patch(
    '/:id',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.updateResident),
  );
  router.delete(
    '/:id',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.deleteResident),
  );
  router.get(
    '/file/template',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.exportResidentTemplate),
  );
  router.post(
    '/file/import',
    catchHandler(middlewares.auth.authAdmin),
    // catchHandler(middlewares.multer.csv()),
    catchHandler(handlers.importResidentsFromCsv),
  );
  router.get(
    '/file/export',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.exportResidents),
  );
};
