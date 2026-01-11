import { TechnicalExceptionTable, TechnicalExceptionType } from './exception-info';

/* example
throw TechnicalException(TechnicalExceptionType.DATABASE_ERROR)
throw TechnicalException(TechnicalExceptionType.DATABASE_ERROR, err as Error, { query: 'SELECT ...' })

return res.status(err.statusCode).json({ message: err.message , err.meta});
*/

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
export const isTechnicalException = (e: unknown): e is TechnicalException => {
  if (typeof e !== 'object' || e === null) return false;

  const maybe = e as Record<string, unknown>;

  return (
    typeof maybe.type === 'number' &&
    typeof maybe.message === 'string' &&
    TechnicalExceptionTable[maybe.type as TechnicalExceptionType] !== undefined
  );
};
