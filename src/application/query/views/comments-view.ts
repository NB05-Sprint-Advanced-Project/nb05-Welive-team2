export interface CommentsView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;

  author: {
    id: string;
    name: string;
  };
}
