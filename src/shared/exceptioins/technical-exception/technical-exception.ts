import { TechnicalExceptionTable, TechnicalExceptionType } from './exception-info';

export interface TechnicalException extends Error {
  type: TechnicalExceptionType;
  error?: Error;
  meta?: unknown;
}

export const TechnicalException = (type: TechnicalExceptionType, error?: Error, meta?: unknown) => {
  const exception = new Error(TechnicalExceptionTable[type]) as TechnicalException;
  exception.error = error;
  exception.type = type;
  exception.meta = meta;
  return exception;
};

// 에러 타입 가드
export const isTechnicalException = (e: unknown): e is TechnicalException =>
  typeof e === 'object' && e !== null && 'type' in e;
