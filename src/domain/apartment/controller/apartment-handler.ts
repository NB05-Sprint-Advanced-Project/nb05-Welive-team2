import { Request, Response } from 'express';
import { validate } from '../../../utils/controller-util';
import { getApartmentsSchema, getApartmentSchema } from '../dto/apartment-request';
import { ApartmentQueryService } from '../service/apartment-query';

export const createApartmentHandlers = (apartmentQueryService: ApartmentQueryService) => {
  const getApartments = async (req: Request, res: Response) => {
    const dto = validate(getApartmentsSchema, req.query);
    const apartments = await apartmentQueryService.getApartments(dto);
    return res.status(200).json(apartments);
  };

  const getApartment = async (req: Request, res: Response) => {
    const dto = validate(getApartmentSchema, req.params);
    const apartment = await apartmentQueryService.getApartment(dto);
    return res.status(200).json(apartment);
  };

  return {
    getApartments,
    getApartment,
  };
};

export type ApartmentHandlers = ReturnType<typeof createApartmentHandlers>;
