import { redisKeys } from '../../../utils/redis-keys';
import { viewApartmentDTO, viewApartmentsDTO } from '../dto/apartment-request';
import { ApartmentsView } from '../dto/view/apartments-view';
import { IApartmentQueryRepo } from '../interface/i-apartment-query';
import { IRedisLocker } from '../../../shared/interface/i-redis-locker';

export const createApartmentQueryService = (
  apartmentQueryRepo: IApartmentQueryRepo,
  redisLocker: IRedisLocker,
) => {
  const getApartments = async (dto: viewApartmentsDTO) => {
    const { key, lock } = redisKeys.apartmentsList({
      ...dto,
    });

    const apartments = await redisLocker.doWork({
      key,
      lockKey: lock,
      work: apartmentQueryRepo.findAll(dto.page, dto.limit, dto.searchKeyword),
    });

    return apartments;
  };

  const getApartment = async (dto: viewApartmentDTO) => {
    const { key, lock } = redisKeys.apartmentById({
      ...dto,
    });

    const apartment = await redisLocker.doWork({
      key,
      lockKey: lock,
      work: apartmentQueryRepo.findById(dto.apartmentId),
    });

    return apartment;
  };

  return {
    getApartments,
    getApartment,
  };
};

export type ApartmentQueryService = ReturnType<typeof createApartmentQueryService>;
