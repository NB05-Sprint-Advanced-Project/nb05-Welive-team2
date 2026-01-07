import { randomUUID } from 'crypto';

export class OptionEntity {
  private _id: string;
  private _title: string;
  private _count: number;

  private constructor(props: { id: string; title: string; count?: number }) {
    this._id = props.id;
    this._title = props.title;
    this._count = props.count ?? 0;
  }

  get id() {
    return this._id;
  }
  get title() {
    return this._title;
  }
  get count() {
    return this._count;
  }

  static create(props: { title: string }) {
    return new OptionEntity({
      id: randomUUID(),
      title: props.title,
    });
  }

  static restore(props: { id: string; title: string; count: number }) {
    return new OptionEntity({ ...props });
  }

  updateTitle(title: string) {
    this._title = title;
  }

  vote() {
    this._count++;
  }
  cancle() {
    this._count--;
  }
}
