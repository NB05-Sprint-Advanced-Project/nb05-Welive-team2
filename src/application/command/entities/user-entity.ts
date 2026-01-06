//
export class UserEntity {
  private readonly _id: string;
  private readonly _username: string;
  private _password: string; // password hashing하기
  private readonly _email: string;
  private readonly _contact: Number;
  private readonly _role: string;

  private constructor(props: {
    id: string;
    username: string;
    password: string;
    email: string;
    contact: Number;
    role: string;
  }) {
    this._id = props.id;
    this._username = props.username;
    this._password = props.password;
    this._email = props.email;
    this._contact = props.contact;
    this._role = props.role;
  }

  static createNew(props: {
    id: string;
    username: string;
    password: string;
    email: string;
    contact: Number;
    role: string;
  }) {
    return new UserEntity({ ...props });
  }

  update(password: string) {
    this._password = password;
  }
}
