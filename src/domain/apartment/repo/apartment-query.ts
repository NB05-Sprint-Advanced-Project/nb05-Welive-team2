import { PrismaClient } from '@prisma/client';
import { ApartmentProps } from '../entity/apartment-entity';
import { ApartmentsView } from '../dto/view/apartments-view';
import { ApartmentView } from '../dto/view/apartment-view';
import { BasePrismaClient } from '../../../shared/base-command-repo';

export const createApartmentQueryRepo = (prisma: BasePrismaClient) => {
  const findById = async (apartmentId: string): Promise<ApartmentView | null> => {
    const apartment = await prisma.apartment.findUnique({
      where: {
        id: apartmentId,
      },
    });

    if (!apartment) {
      return null;
    }

    const totalBuildings = apartment.buildingNumberTo - apartment.buildingNumberFrom + 1;
    const totalUnits = apartment.unitCountPerFloor * apartment.floorCountPerBuilding;

    return {
      id: apartment.id,
      name: apartment.name,
      address: apartment.address,
      description: apartment.description,
      officeNumber: apartment.officeNumber,
      buildings: Array.from(
        { length: totalBuildings },
        (_, i) => apartment.buildingNumberFrom + i,
      ) as [number], // 아파트 동수
      units: Array.from({ length: totalUnits }, (_, i) => {
        const floor = Math.floor(i / apartment.unitCountPerFloor) + 1;
        const unit = (i % apartment.unitCountPerFloor) + 1;
        return floor * 100 + unit;
      }) as [number], // 아파트 호수
    };
  };

  const findAll = async (
    page: number,
    limit: number,
    searchKeyword: string,
  ): Promise<ApartmentsView | null> => {
    const skip = (page - 1) * limit;

    const where = {
      ...(searchKeyword && {
        OR: [{ name: { contains: searchKeyword } }],
      }),
    };

    const [apartments, totalCount] = await Promise.all([
      prisma.apartment.findMany({
        where,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    if (apartments.length === 0) {
      return null;
    }

    return {
      data: apartments.map((apartment) => {
        const totalBuildings = apartment.buildingNumberTo - apartment.buildingNumberFrom + 1;
        const totalUnits = apartment.unitCountPerFloor * apartment.floorCountPerBuilding;
        return {
          id: apartment.id,
          name: apartment.name,
          address: apartment.address,
          description: apartment.description,
          officeNumber: apartment.officeNumber,
          buildings: Array.from(
            { length: totalBuildings },
            (_, i) => apartment.buildingNumberFrom + i,
          ) as [number],
          units: Array.from({ length: totalUnits }, (_, i) => {
            const floor = Math.floor(i / apartment.unitCountPerFloor) + 1;
            const unit = (i % apartment.unitCountPerFloor) + 1;
            return floor * 100 + unit;
          }) as [number], // 아파트 호수
        };
      }),
      totalCount: apartments.length,
      page: page,
      limit: limit,
      hasNext: true,
    };
  };

  return {
    findById,
    findAll,
  };
};
