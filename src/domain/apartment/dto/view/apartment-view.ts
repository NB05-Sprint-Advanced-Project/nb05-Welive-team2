export interface ApartmentView {
  id: string;
  name: string;
  address: string;
  description: string;
  officeNumber: string;
  buildings: [number];
  units: [number];
}
