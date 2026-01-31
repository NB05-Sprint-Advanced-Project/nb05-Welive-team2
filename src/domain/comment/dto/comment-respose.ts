export type CommentResponse = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
  };
};

export const CommentMapper = {
  toResponse(entity: CommentResponse) {
    return {
      id: entity.id,
      content: entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      author: {
        id: entity.author.id,
        name: entity.author.name,
      },
    };
  },
};
