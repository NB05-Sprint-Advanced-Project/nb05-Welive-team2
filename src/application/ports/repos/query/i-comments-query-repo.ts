export interface ICommentsQueryRepo {
  findAll(page: number, limit: number, resourceId: string, resourceType: string): Promise<any[]>;
}
