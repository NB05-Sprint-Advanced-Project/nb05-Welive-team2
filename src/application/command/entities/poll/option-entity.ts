export class OptionsEntity {
  private readonly _title: string;
  private readonly _count: number;

  private constructor(props: { title: string }) {
    this._title = props.title;
    this._count = 0;
  }

  get title() {
    return this._title;
  }
  get count() {
    return this._count;
  }
}
