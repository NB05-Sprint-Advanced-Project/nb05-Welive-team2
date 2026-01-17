import { PrismaClient } from '@prisma/client';
import { ApartmentProps } from '../entity/apartment-entity';
import { ApartmentsView } from '../dto/view/apartments-view';
import { ApartmentView } from '../dto/view/apartment-view';

export const createApartmentQueryRepo = (prisma: PrismaClient) => {
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
    const totalUnits =
      apartment.unitCountPerFloor * apartment.floorCountPerBuilding * totalBuildings;

    return {
      id: apartment.id,
      name: apartment.name,
      address: apartment.address,
      description: apartment.description,
      officeNumber: apartment.officeNumber,
      buildings: [totalBuildings],
      units: [totalUnits],
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
        const totalUnits =
          apartment.unitCountPerFloor * apartment.floorCountPerBuilding * totalBuildings;
        return {
          id: apartment.id,
          name: apartment.name,
          address: apartment.address,
          description: apartment.description,
          officeNumber: apartment.officeNumber,
          buildings: [totalBuildings],
          units: [totalUnits],
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
