export enum TechnicalExceptionType {
  DB_ERROR,
  TIMEOUT,
  OPTIMISTIC_LOCK_FAILED,
  UNIQUE_VIOLATION_EMAIL,
  UNIQUE_VIOLATION_USERNAME,
  UNIQUE_VIOLATION_CONTACT,
  ROW_NOT_FOUND,
  UNEXPECTED_STATE,
  UNIQUE_VIOLATION_ADDRESS,
  UNKNOWN_ERROR,
  FOREIGN_KEY_VIOLATION,
  RECORD_NOT_FOUND,
  USER_NOT_FOUND,
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
  [TechnicalExceptionType.UNIQUE_VIOLATION_ADDRESS]:
    '아파트 주소 유니크 제약 조건 위반 에러가 발생했습니다',
  [TechnicalExceptionType.ROW_NOT_FOUND]: '해당 행이 존재하지 않습니다.',
  [TechnicalExceptionType.UNEXPECTED_STATE]: '처리되지 않은 사용자 ROLE 역할 값이 감지되었습니다.',
  [TechnicalExceptionType.UNKNOWN_ERROR]: '알 수 없는 기술적 에러입니다.',
  [TechnicalExceptionType.FOREIGN_KEY_VIOLATION]: '참조 대상이 존재하지 않습니다.',
  [TechnicalExceptionType.RECORD_NOT_FOUND]: '해당 레코드를 찾을 수 없습니다.',
  [TechnicalExceptionType.USER_NOT_FOUND]: '해당하는 유저가 없습니다.',
};
