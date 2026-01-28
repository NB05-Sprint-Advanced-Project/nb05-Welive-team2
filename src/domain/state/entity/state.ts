import { randomUUID } from 'crypto';

export enum WorkType {
  CSV = 'CSV',
  ALARM = 'alarm',
}

export enum StatusType {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
}

export interface NotificationPayload {
  id: string;
  userId?: string;
  message: string;
  apartmentId?: string;
  receiverType: string;
}

export interface CSVPayload {}

export type StateProps = {
  readonly id: string;
  readonly workType: WorkType;
  readonly status: StatusType;
  readonly payload: NotificationPayload | CSVPayload;
};

export type NotificationStateProps = {
  readonly id: string;
  readonly workType: WorkType;
  readonly status: StatusType;
  readonly payload: NotificationPayload;
};

export type CSVStateProps = {
  readonly id: string;
  readonly workType: WorkType;
  readonly status: StatusType;
  readonly payload: CSVPayload;
};

export const StateEntity = {
  create: (props: {
    workType: WorkType;
    status: StatusType;
    payload: NotificationPayload | CSVPayload;
  }): StateProps => {
    return {
      id: randomUUID(),
      ...props,
      payload: {
        id: randomUUID(),
        ...props.payload,
      },
    };
  },

  restore: (props: {
    id: string;
    workType: WorkType;
    status: StatusType;
    payload: NotificationPayload | CSVPayload;
  }): StateProps => {
    return {
      ...props,
    };
  },

  update: (props: {
    state: StateProps; // DB에 저장된 데이터
    status: StatusType;
  }): StateProps => {
    return {
      ...props.state,
      status: props.status,
    };
  },
};
