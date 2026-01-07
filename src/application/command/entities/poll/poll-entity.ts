import { PollStatus } from '@prisma/client';
import { OptionsEntity } from './option-entity';
import { randomUUID } from 'crypto';

export class PollEntity {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _title: string;
  private readonly _content: string;
  private readonly _status: PollStatus;
  private readonly _startDate: Date;
  private readonly _endDate: Date;
  private readonly _apartmentId: string;
  private readonly _building: number;
  private readonly _userId: string;

  private _options: OptionsEntity[];

  private constructor(props: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    content: string;
    status: PollStatus;
    startDate: Date;
    endDate: Date;
    apartmentId: string;
    building: number;
    userId: string;
    options: OptionsEntity[];
  }) {
    this._id = props.id;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._title = props.title;
    this._content = props.content;
    this._status = props.status;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._apartmentId = props.apartmentId;
    this._building = props.building;
    this._userId = props.userId;
    this._options = props.options;
  }

  get id() {
    return this._id;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
  get title() {
    return this._title;
  }
  get content() {
    return this._content;
  }
  get status() {
    return this._status;
  }
  get startDate() {
    return this._startDate;
  }
  get endDate() {
    return this._endDate;
  }
  get apartmentId() {
    return this._apartmentId;
  }
  get building() {
    return this._building;
  }
  get userId() {
    return this._userId;
  }
  get options() {
    return [...this._options];
  }

  static create(props: {
    title: string;
    content: string;
    startDate: Date;
    endDate: Date;
    apartmentId: string;
    building: number;
    options: OptionsEntity[];
  }): PollEntity {
    const now = new Date();

    let status: PollStatus = 'IN_PROGRESS';
    if (props.endDate < now) {
      status = 'CLOSED';
    } else if (props.startDate > now) {
      status = 'PENDING';
    }

    const userId = 'test'; // 추후 로그한 관리자의 id 가져오도록 수정

    return new PollEntity({
      ...props,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      userId,
      status,
    });
  }

  static restore(props: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    content: string;
    status: PollStatus;
    startDate: Date;
    endDate: Date;
    apartmentId: string;
    building: number;
    userId: string;
    options: OptionsEntity[];
  }): PollEntity {
    return new PollEntity({ ...props });
  }
}
