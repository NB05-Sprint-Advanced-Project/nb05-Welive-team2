/* eslint-disable @typescript-eslint/no-explicit-any */
export type ComplaintResponse = {
  id: string;
  title: string;
  content: string;
  status: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewsCount: number;
  apartmentId: string;
  complainant: {
    id: string;
    name: string;
  };
  commentCount: number;
};

export const ComplaintMapper = {
  toResponse(entity: any): ComplaintResponse {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      status: entity.status,
      isPublic: entity.isPublic,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      viewsCount: entity.viewsCount,
      apartmentId: entity.apartmentId,
      complainant: {
        id: entity.complainant.id,
        name: entity.complainant.name,
      },
      commentCount: 0, // 생성시에만 사용 되어 0으로 초기화
    };
  },
};
