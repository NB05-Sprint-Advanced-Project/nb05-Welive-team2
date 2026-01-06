import { IEventQueryRepo } from '../../ports/repos/query/i-event-query-repo';
import { EventView } from '../views/event-view';

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
