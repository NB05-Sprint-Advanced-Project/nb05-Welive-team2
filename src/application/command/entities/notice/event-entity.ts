import { randomUUID } from 'crypto';

export type EventProps = {
  readonly id: string;
  startDate: Date;
  endDtae: Date;
};

export const EventEntity = {
  create: (props: { startDate: Date; endDate: Date }): EventProps => {
    return {
      id: randomUUID(),
      startDate: props.startDate,
      endDtae: props.endDate,
    } as EventProps;
  },
  updateDate: (event: EventProps, props: { startDate: Date; endDate: Date }) => {
    event.startDate = props.startDate;
    event.endDtae = props.endDate;
  },
};
