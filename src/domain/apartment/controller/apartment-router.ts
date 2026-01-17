import { Router } from 'express';
import path from 'path';
import { catchHandler } from '../../../utils/controller-util';
import { ApartmentHandlers } from './apartment-handler';

export const registerApartmentRoutes = (router: Router, handlers: ApartmentHandlers) => {
  router.get('/', catchHandler(handlers.getApartments));
  router.get('/:apartmentId', catchHandler(handlers.getApartment));
  return { path, router };
};
