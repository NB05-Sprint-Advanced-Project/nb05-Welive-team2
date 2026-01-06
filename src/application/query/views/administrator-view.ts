export interface AdministratorView {
  data: [
    {
      id: string;
      email: string;
      contact: string;
      name: string;
      joinStatus: string;
      adminOf: {
        id: string;
        name: string;
        address: string;
        description: string;
        officeNumber: string;
      };
    },
  ];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
