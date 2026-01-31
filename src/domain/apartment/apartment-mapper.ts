import { Apartment } from '@prisma/client';
import { ApartmentView } from './dto/view/apartment-view';
import { ApartmentsView } from './dto/view/apartments-view';

export const ApartmentMapper = {
  toApartmentView(apartment: Apartment): ApartmentView {
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
  },

  toApartmentsView(params: {
    apartments: Apartment[];
    totalCount: number;
    page: number;
    limit: number;
  }): ApartmentsView {
    return {
      data: params.apartments.map((apartment) => {
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
      totalCount: params.totalCount,
      page: params.page,
      limit: params.limit,
      hasNext: params.totalCount > params.page * params.limit,
    };
  },
};
