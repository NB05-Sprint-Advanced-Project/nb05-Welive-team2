import { randomUUID } from 'crypto';

export type EventModel = {
  readonly id: string;
  startDate: Date;
  endDtae: Date;
};

export const EventEntity = {
  create: (props: { startDate: Date; endDate: Date }): EventModel => {
    return {
      id: randomUUID(),
      startDate: props.startDate,
      endDtae: props.endDate,
    } as EventModel;
  },
  updateDate: (event: EventModel, props: { startDate: Date; endDate: Date }) => {
    event.startDate = props.startDate;
    event.endDtae = props.endDate;
  },
};
