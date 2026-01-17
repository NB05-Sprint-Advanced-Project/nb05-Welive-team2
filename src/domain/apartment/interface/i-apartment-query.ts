import { Apartment } from '@prisma/client';
import { ApartmentsView } from '../dto/view/apartments-view';
import { ApartmentView } from '../dto/view/apartment-view';

export interface IApartmentQueryRepo {
  findById(apartmentId: string): Promise<ApartmentView | null>;
  findAll(page: number, limit: number, searchKeyword: string): Promise<ApartmentsView | null>;
}
