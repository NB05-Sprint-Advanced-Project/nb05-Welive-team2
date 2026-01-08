import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class UserEntity {
  private _id: string;
  private readonly _username: string;
  private _password: string;
  private readonly _email: string;
  private readonly _contact: Number;
  private readonly _role: string;

  private constructor(props: {
    username: string;
    password: string;
    email: string;
    contact: Number;
    role: string;
  }) {
    this._id = crypto.randomUUID();
    this._username = props.username;
    this._password = props.password;
    this._email = props.email;
    this._contact = props.contact;
    this._role = props.role;
  }

  static createNew(props: {
    username: string;
    password: string;
    email: string;
    contact: Number;
    role: string;
  }) {
    const hashedPassword = bcrypt.hashSync(props.password, 10);
    const user = new UserEntity({ ...props, password: hashedPassword });
    return user;
  }

  update(password: string) {
    this._password = bcrypt.hashSync(password, 10);
  }

  comparePassword(plainPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, this._password);
  }
}
