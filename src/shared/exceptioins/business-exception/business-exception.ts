import { BusinessExceptionTable, BusinessExceptionType } from './exception-info';

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
