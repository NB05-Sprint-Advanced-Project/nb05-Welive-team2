import { BusinessExceptionTable, BusinessExceptionType } from './exception-info';

/* example
throw BusinessException(BusinessExceptionType.NOT_FOUND)
throw BusinessException(BusinessExceptionType.NOT_FOUND, err as Error)

return res.status(err.statusCode).json({ message: err.message });
*/

export interface BusinessException extends Error {
  statusCode: number;
  type: BusinessExceptionType;
  error?: Error;
}

export const BusinessException = (type: BusinessExceptionType, error?: Error) => {
  const exception = new Error(BusinessExceptionTable[type].message) as BusinessException;
  exception.statusCode = BusinessExceptionTable[type].statusCode;
  exception.type = type;
  exception.error = error;
  return exception;
};

// 에러 타입 가드
export const isBusinessException = (e: unknown): e is BusinessException => {
  if (typeof e !== 'object' || e === null) return false;

  const maybe = e as Record<string, unknown>;

  return (
    typeof maybe.statusCode === 'number' &&
    typeof maybe.message === 'string' &&
    typeof maybe.type === 'string' &&
    BusinessExceptionTable[maybe.type as BusinessExceptionType] !== undefined
  );
};
