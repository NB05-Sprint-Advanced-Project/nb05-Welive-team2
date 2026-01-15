import { CommentProps } from '../comment-entity';

export type ICommentCommandRepo = {
  findById: (commentId: string) => Promise<CommentProps>;
  create: (entity: CommentProps) => Promise<CommentProps>;
  update: (entity: CommentProps) => Promise<void>;
  remove: (commentId: string) => Promise<void>;
};
