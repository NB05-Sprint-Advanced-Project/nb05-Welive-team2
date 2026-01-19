import { Router } from 'express';
import path from 'path';
import { catchHandler } from '../../../utils/controller-util';
import { ResidentUserHandlers } from './resident-user-handler';

export const registerResidentUserRoutes = (router: Router, handlers: ResidentUserHandlers) => {
  router.post('/', catchHandler(handlers.createResident));
  router.get('/', catchHandler(handlers.getResidents));
  router.get('/:id', catchHandler(handlers.getResident));
  router.patch('/:id', catchHandler(handlers.updateResident));
  router.delete('/:id', catchHandler(handlers.deleteResident));
  router.get('/file/template');
  router.post('/file/import');
  router.get('/file/export');
};
