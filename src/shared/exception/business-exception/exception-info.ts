export enum BusinessExceptionType {
  APARTMENT_NOT_FOUND,
  EMAIL_ALREADY_IN_USE,
  USERNAME_ALREADY_IN_USE,
  CONTACT_ALREADY_IN_USE,
  BAD_REQUEST,
  INVALID_REQUEST,
  INVALID_INPUT,
  NOT_FOUND,
  UNAUTHORIZED,
  FORBIDDEN,
  CONFLICT,
  VALIDATION_ERROR,
  COMPLAINT_NOT_FOUND,
  USER_NOT_FOUND,
  CONCURRENT_MODIFICATION,
  ADDRESS_ALREADY_IN_USE,
  REQ_INFO_INVALID_PLEASE_RETRY,
  DELETED,
}

export const BusinessExceptionTable: Record<
  BusinessExceptionType,
  { statusCode: number; message?: string }
> = {
  // 공통
  [BusinessExceptionType.BAD_REQUEST]: {
    statusCode: 400,
    message: '요청이 올바르지 않습니다.',
  },
  [BusinessExceptionType.INVALID_REQUEST]: {
    statusCode: 400,
    message: '요청 형식이 올바르지 않습니다.',
  },
  [BusinessExceptionType.VALIDATION_ERROR]: {
    statusCode: 422,
  },
  [BusinessExceptionType.REQ_INFO_INVALID_PLEASE_RETRY]: {
    statusCode: 404,
    message: '요청하신 정보가 유효하지 않습니다. 확인 후 다시 시도해 주세요.',
  },
  [BusinessExceptionType.DELETED]: {
    statusCode: 204,
    message: '삭제되었습니다.',
  },

  // 형식 오류
  [BusinessExceptionType.INVALID_INPUT]: {
    statusCode: 422,
    message: '입력값을 확인해 주세요.',
  },

  // 존재 오류
  [BusinessExceptionType.NOT_FOUND]: {
    statusCode: 404,
    message: '요청을 찾을 수 없습니다.',
  },
  [BusinessExceptionType.COMPLAINT_NOT_FOUND]: {
    statusCode: 404,
    message: '민원을 찾을 수 없습니다.',
  },
  [BusinessExceptionType.USER_NOT_FOUND]: {
    statusCode: 404,
    message: '유저를 찾을 수 없습니다.',
  },
  [BusinessExceptionType.APARTMENT_NOT_FOUND]: {
    statusCode: 404,
    message: '아파트를 찾을 수 없습니다.',
  },

  // 권한 오류
  [BusinessExceptionType.UNAUTHORIZED]: {
    statusCode: 401,
    message: '로그인이 필요합니다.',
  },
  [BusinessExceptionType.FORBIDDEN]: {
    statusCode: 403,
    message: '권한이 없습니다.',
  },

  // 중복, 충돌
  [BusinessExceptionType.CONFLICT]: {
    statusCode: 409,
    message: '이미 처리된 요청입니다.',
  },
  [BusinessExceptionType.CONCURRENT_MODIFICATION]: {
    statusCode: 409,
    message: '다른 변경이 감지되었습니다. 다시 시도해주세요.',
  },
  [BusinessExceptionType.EMAIL_ALREADY_IN_USE]: {
    statusCode: 409,
    message: '이미 사용중인 이메일입니다.',
  },
  [BusinessExceptionType.USERNAME_ALREADY_IN_USE]: {
    statusCode: 409,
    message: '이미 사용중인 닉네임입니다.',
  },
  [BusinessExceptionType.CONTACT_ALREADY_IN_USE]: {
    statusCode: 409,
    message: '이미 사용중인 연락처입니다.',
  },
  [BusinessExceptionType.ADDRESS_ALREADY_IN_USE]: {
    statusCode: 409,
    message: '이미 사용중인 아파트 주소입니다.',
  },

  // 기타
};
