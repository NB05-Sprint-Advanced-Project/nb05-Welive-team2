import { CommentProps } from '../comment-entity';

export type ICommentCommandRepo = {
  findById: (commentId: string) => Promise<CommentProps | null>;
  create: (entity: CommentProps) => Promise<CommentProps>;
  update: (entity: CommentProps) => Promise<void>;
  delete: (commentId: string) => Promise<void>;
};
