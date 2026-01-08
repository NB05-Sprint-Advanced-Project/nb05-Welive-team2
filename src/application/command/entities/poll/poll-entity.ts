import { PollStatus } from '@prisma/client';
import { OptionEntity } from './option-entity';
import { randomUUID } from 'crypto';

export class PollEntity {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private _title: string;
  private _content: string;
  private _status: PollStatus;
  private _startDate: Date;
  private _endDate: Date;
  private readonly _apartmentId: string;
  private _building: number;
  private readonly _userId: string;

  private _options: OptionEntity[];

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
    options: OptionEntity[];
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
    options: OptionEntity[];
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
    options: OptionEntity[];
  }): PollEntity {
    return new PollEntity({ ...props });
  }

  update(props: {
    title?: string;
    content?: string;
    startDate?: Date;
    endDate?: Date;
    building?: number;
    options?: {
      id?: string;
      title: string;
    }[];
  }) {
    if (props.title) {
      this._title = props.title;
    }
    if (props.content) {
      this._content = props.content;
    }
    if (props.startDate) {
      this._startDate = props.startDate;
    }
    if (props.endDate) {
      this._endDate = props.endDate;
    }
    if (props.building) {
      this._building = props.building;
    }
    if (props.options) {
      const existOpt = props.options.filter((opt) => opt.id !== undefined);
      const newOpt = props.options.filter((opt) => !opt.id);

      for (const opt of newOpt) {
        this._options.push(OptionEntity.create({title: opt.title}));
      }

      for(const opt of existOpt){
        const target = this._options.find((befOpt) => befOpt.id === opt.id);
        if(target){
          target.updateTitle(opt.title);
        }
      }
    }
  }
}
