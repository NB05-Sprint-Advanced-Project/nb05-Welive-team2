export interface ApartmentsView {
  data: {
    id: string;
    name: string;
    address: string;
    description: string;
    officeNumber: string;
    buildings: [number];
    units: [number];
  }[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
