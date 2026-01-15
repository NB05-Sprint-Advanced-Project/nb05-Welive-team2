import { IEventQueryRepo } from '../interface/i-event-query-repo';
import { EventView } from '../dto/event-view';

export const createEventQueryService = (repo: IEventQueryRepo) => {
  const getAllEvent = async (
    apartmentId: string,
    year: number,
    month: string,
  ): Promise<EventView[]> => {
    const events = await repo.findAll(apartmentId, year, month);

    return events;
  };
  return { getAllEvent };
};
