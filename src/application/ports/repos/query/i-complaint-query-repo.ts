export interface IComplaintQueryRepo {
  findId(complaintId: string): Promise<any>;
  findAll(
    page: number,
    limit: number,
    searchKeyword: string,
    status: string,
    isPublic: boolean,
    building: number,
    unit: number,
  ): Promise<any[]>;
}
