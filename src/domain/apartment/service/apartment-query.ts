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

    // // DB 조회했을때
    // 2000명 : 623.82ms
    // 3000명 : 1s
    // 4000명 : 2.97s
    // const apartments = await apartmentQueryRepo.findAll(
    //   dto.page,
    //   dto.limit,
    //   dto.searchKeyword,
    // );

    // redis 락 없이 사용했을때
    // - 2000명 : 13.06ms
    // - 3000명 : 68.09ms
    // - 4000명 : 458ms, 576.49
    // - 5000명 : 524ms

    // redis 락 사용했을때
    // - 2000명 : 8.71ms
    // - 3000명 : 43.78ms
    // - 4000명 : 333.19ms, 150ms
    // - 5000명 : 1.05ms
    const apartments = await redisLocker.doWork({
      key,
      lockKey: lock,
      redisLock: false,
      work: () => apartmentQueryRepo.findAll(dto.page, dto.limit, dto.searchKeyword),
    });
    // const apartments = await apartmentQueryRepo.findAll(dto.page, dto.limit, dto.searchKeyword)
    return apartments;
  };

  const getApartment = async (dto: viewApartmentDTO) => {
    const { key, lock } = redisKeys.apartmentById({
      ...dto,
    });

    const apartment = await redisLocker.doWork({
      key,
      lockKey: lock,
      work: () => apartmentQueryRepo.findById(dto.apartmentId),
    });

    return apartment;
  };

  return {
    getApartments,
    getApartment,
  };
};

export type ApartmentQueryService = ReturnType<typeof createApartmentQueryService>;
