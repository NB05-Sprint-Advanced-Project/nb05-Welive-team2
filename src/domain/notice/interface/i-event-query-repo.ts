import { EventView } from '../dto/event-view';

export interface IEventQueryRepo {
  findAll(apartmentId: string, year: number, month: string): Promise<EventView[]>;
}
