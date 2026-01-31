import { ApartmentProps } from '../entity/apartment-entity';
import { Apartment } from '@prisma/client';

export interface IApartmentCommandRepo {
  create(data: ApartmentProps): Promise<Apartment>;
  update(data: ApartmentProps): Promise<Apartment>;
  removeById(id: string): Promise<void>;
  findById(id: string): Promise<Apartment | null>;
}
