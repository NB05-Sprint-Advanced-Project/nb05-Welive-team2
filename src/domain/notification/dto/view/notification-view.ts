export interface NotificationView {
  data: {
    id: string;
    createdAt: Date;
    content: string;
    isChecked: boolean;
  }[];

  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
