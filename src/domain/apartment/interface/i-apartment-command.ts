import { Apartment } from '@prisma/client';

export interface IApartmentCommandRepo {
  create(model: Apartment): Promise<Apartment>;
  update(model: Apartment): Promise<Apartment>;
  remove(apartmentId: string): Promise<void>;
  findById(apartmentId: string): Promise<Apartment | null>;
}
