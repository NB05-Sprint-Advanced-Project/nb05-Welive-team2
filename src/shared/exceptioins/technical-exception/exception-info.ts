export enum TechnicalExceptionType {
  DB_ERROR,
  TIMEOUT,
}

export const TechnicalExceptionTable: Record<TechnicalExceptionType, string> = {
  [TechnicalExceptionType.DB_ERROR]: '데이터 처리 중 오류가 발생했습니다',
  [TechnicalExceptionType.TIMEOUT]: '요청이 시간 초과되었습니다',
};
