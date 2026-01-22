export const redisKeys = {
  administratorsList: (params: {
    page: number;
    limit: number;
    searchKeyword: string;
    joinStatus?: string;
  }) => {
    const key = `administrators:list:${params.page}:${params.limit}:${params.searchKeyword}:${params.joinStatus}`;
    const lock = `lock:administrators:list:${params.page}:${params.limit}:${params.searchKeyword}:${params.joinStatus}`;
    return { key, lock };
  },

  apartmentsList: (params: { page: number; limit: number; searchKeyword: string }) => {
    const key = `apartments:list:${params.page}:${params.limit}:${params.searchKeyword}`;
    const lock = `lock:apartments:list:${params.page}:${params.limit}:${params.searchKeyword}`;
    return { key, lock };
  },

  apartmentById: (params: { apartmentId: string }) => {
    const key = `apartment:by-id:${params.apartmentId}`;
    const lock = `lock:apartment:by-id:${params.apartmentId}`;
    return { key, lock };
  },
};
