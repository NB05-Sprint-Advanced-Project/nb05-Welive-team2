import { ApartmentsView } from '../dto/view/apartments-view';
import { ApartmentView } from '../dto/view/apartment-view';
import { BasePrismaClient } from '../../../shared/base-command-repo';
import { ApartmentMapper } from '../apartment-mapper';

export const createApartmentQueryRepo = (prisma: BasePrismaClient) => {
  const findById = async (id: string): Promise<ApartmentView | null> => {
    const apartment = await prisma.apartment.findUnique({
      where: { id },
    });

    if (!apartment) {
      return null;
    }

    const apartmentView = ApartmentMapper.toApartmentView(apartment);
    return apartmentView;
  };

  const findAll = async (params: {
    page: number;
    limit: number;
    searchKeyword: string;
  }): Promise<ApartmentsView | null> => {
    const { page, limit, searchKeyword } = params;

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
      prisma.apartment.count({ where }),
    ]);

    if (apartments.length === 0) {
      return null;
    }

    const apartmentsView = ApartmentMapper.toApartmentsView({
      apartments,
      totalCount,
      page,
      limit,
    });

    return apartmentsView;
  };

  return {
    findById,
    findAll,
  };
};
