export interface UserView {
  id: string;
  username: string;
  password: string;
  email: string;
  contact: string;
  name: string;
  role: string;
  avatar: string;
  joinStatus: string;
  isActive: true;
  adminOf: {
    id: string;
    name: string;
  };
  resident: {
    id: string;
    apartmentId: string;
    building: number;
    unit: number;
    isHouseholder: boolean;
  };
}
