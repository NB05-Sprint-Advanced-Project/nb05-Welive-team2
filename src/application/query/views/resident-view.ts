export interface ResidentView {
  data: [
    {
      id: string;
      email: string;
      contact: string;
      name: string;
      joinStatus: string;
      resident: {
        id: string;
        building: string;
        unit: string;
      };
    },
  ];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
