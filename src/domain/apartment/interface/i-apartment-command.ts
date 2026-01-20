import { ApartmentProps } from '../entity/apartment-entity';
import { Apartment } from '@prisma/client';

export interface IApartmentCommandRepo {
  create(model: ApartmentProps): Promise<Apartment>;
  update(model: ApartmentProps): Promise<Apartment>;
  remove(apartmentId: string): Promise<void>;
  findById(apartmentId: string): Promise<Apartment | null>;
}
