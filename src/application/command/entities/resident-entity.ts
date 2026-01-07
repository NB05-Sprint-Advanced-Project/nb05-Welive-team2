export class ResidentEntity {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _name: string;
  private readonly _email: string;
  private _contact: string; // 연락처
  private _building: number;
  private _unit: number;
  private _isHouseholder: boolean;
  
  private constructor(props: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    email: string;
    contact: string;
    building: number;
    unit: number;
    is
  }) {

  }
}