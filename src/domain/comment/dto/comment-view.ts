export interface CommentView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;

  author: {
    id: string;
    name: string;
  };
}
