import { randomUUID } from 'crypto';

export enum WorkType {
  CSV = 'CSV',
  ALARM = 'alarm',
}

export enum StatusType {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
}

export interface LiveNotificationPayload {
  id: string;
  createdAt: string;
  content: string;
  isChecked: boolean;
}

export interface NotificationPayload {
  userId?: string;
  message: string;
  apartmentId?: string;
  receiverType: string;
}

export interface CSVPayload {
  userId: string;
  filePaths: string[];
}

export type CSVPayloadPersist = CSVPayload & {
  id: string;
};

export type NotificationPayloadPersist = NotificationPayload & {
  id: string;
};

export type PayloadPersist = NotificationPayloadPersist | CSVPayloadPersist;

export type StateProps = {
  readonly id: string;
  readonly workType: WorkType;
  readonly status: StatusType;
  readonly payload: PayloadPersist;
};

export type NotificationStateProps = {
  readonly id: string;
  readonly workType: WorkType;
  readonly status: StatusType;
  readonly payload: NotificationPayloadPersist;
};

export type CSVStateProps = {
  readonly id: string;
  readonly workType: WorkType;
  readonly status: StatusType;
  readonly payload: CSVPayloadPersist;
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
    payload: NotificationPayloadPersist | CSVPayloadPersist;
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
