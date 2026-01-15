export interface EventView {
  id: string;
  startDate: Date;
  endDate: Date;
  category: string;
  title: string;
  apartmentId: string;
  resourceId: string;
  resourceType: 'NOTICE' | 'POLL';
}
