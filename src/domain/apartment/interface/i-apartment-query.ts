import { ApartmentsView } from '../dto/view/apartments-view';
import { ApartmentView } from '../dto/view/apartment-view';

export interface IApartmentQueryRepo {
  findById(id: string): Promise<ApartmentView | null>;
  findAll(params: {
    page: number;
    limit: number;
    searchKeyword: string;
  }): Promise<ApartmentsView | null>;
}
