export enum TechnicalExceptionType {
  DB_ERROR,
  TIMEOUT,
  OPTIMISTIC_LOCK_FAILED,
  UNIQUE_VIOLATION_EMAIL,
  UNIQUE_VIOLATION_USERNAME,
  UNIQUE_VIOLATION_CONTACT,
}

export const TechnicalExceptionTable: Record<TechnicalExceptionType, string> = {
  [TechnicalExceptionType.DB_ERROR]: '데이터 처리 중 오류가 발생했습니다',
  [TechnicalExceptionType.TIMEOUT]: '요청이 시간 초과되었습니다',

  [TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED]:
    '데이터 버전 충돌이 발생했습니다.(낙관적 락 실패)',

  [TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL]:
    '이메일 유니크 제약 조건 위반 에러가 발생했습니다',
  [TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME]:
    '닉네임 유니크 제약 조건 위반 에러가 발생했습니다',
  [TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT]:
    '연락처 유니크 제약 조건 위반 에러가 발생했습니다',
};
