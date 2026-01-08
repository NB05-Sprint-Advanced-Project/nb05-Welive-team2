export enum TechnicalExceptionType {
  DB_ERROR,
  TIMEOUT,
  OPTIMISTIC_LOCK_FAILED,
}

export const TechnicalExceptionTable: Record<TechnicalExceptionType, string> = {
  [TechnicalExceptionType.DB_ERROR]: '데이터 처리 중 오류가 발생했습니다',
  [TechnicalExceptionType.TIMEOUT]: '요청이 시간 초과되었습니다',
  [TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED]:
    '데이터 버전 충돌이 발생했습니다.(낙관적 락 실패)',
};
