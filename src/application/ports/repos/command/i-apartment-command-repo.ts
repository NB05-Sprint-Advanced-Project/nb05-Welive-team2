import { Apartment } from '@prisma/client';

export interface IApartmentCommandRepo {
  create(model: Apartment): Promise<Apartment>;
  update(model: Apartment): Promise<Apartment>;
  delete(apartmentId: string): Promise<void>;
}
