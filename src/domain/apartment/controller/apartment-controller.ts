import { createBaseController } from '../../../utils/controller-util';
import { ApartmentQueryService } from '../service/apartment-query';
import { createApartmentHandlers } from './apartment-handler';
import { registerApartmentRoutes } from './apartment-router';

export const createApartmentController = (apartmentQueryService: ApartmentQueryService) => {
  const { path, router } = createBaseController('/api/v2/apartments');

  const handlers = createApartmentHandlers(apartmentQueryService);

  registerApartmentRoutes(router, handlers);

  return { path, router };
};

export type ApartmentController = ReturnType<typeof createApartmentController>;
