import { viewApartmentDTO, viewApartmentsDTO } from '../dto/apartment-request';
import { IApartmentQueryRepo } from '../interface/i-apartment-query';

export const createApartmentQueryService = (apartmentQueryRepo: IApartmentQueryRepo) => {
  const getApartments = async (dto: viewApartmentsDTO) => {
    const { page, limit, searchKeyword } = dto;
    const apartments = await apartmentQueryRepo.findAll(page, limit, searchKeyword);
    return apartments;
  };

  const getApartment = async (dto: viewApartmentDTO) => {
    const apartment = await apartmentQueryRepo.findById(dto.apartmentId);
    return apartment;
  };

  return {
    getApartments,
    getApartment,
  };
};

export type ApartmentQueryService = ReturnType<typeof createApartmentQueryService>;
