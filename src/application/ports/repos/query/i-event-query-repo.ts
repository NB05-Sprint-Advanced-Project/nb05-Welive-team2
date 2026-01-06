import { EventView } from '../../../query/views/event-view';

export interface IEventQueryRepo {
  findAll(apartmentId: string, year: number, month: string): Promise<EventView[]>;
}
