/* eslint-disable @typescript-eslint/no-explicit-any */
import { TechnicalExceptionTable, TechnicalExceptionType } from './exception-info';

/* example
throw TechnicalException(TechnicalExceptionType.DATABASE_ERROR)
throw TechnicalException(TechnicalExceptionType.DATABASE_ERROR, err as Error, { query: 'SELECT ...' })
*/

export type TechnicalException = Error & {
  type: TechnicalExceptionType;
  error?: Error;
  meta?: unknown;
};

export const TechnicalException = ({
  type,
  error,
  meta,
}: {
  type: TechnicalExceptionType;
  error?: Error;
  meta?: unknown;
}) => {
  const exception = new Error(TechnicalExceptionTable[type]) as TechnicalException;
  exception.error = error;
  exception.type = type;
  exception.meta = meta;
  return exception;
};

// 에러 타입 가드
export const isTechnicalException = (error: unknown): error is TechnicalException => {
  if (!(error instanceof Error)) return false;

  const maybe = error as any;

  const hasRequiredFields = typeof maybe.type === 'number' && typeof maybe.message === 'string';

  if (!hasRequiredFields) return false;

  const expectedMessage = TechnicalExceptionTable[maybe.type as TechnicalExceptionType];

  return expectedMessage !== undefined && maybe.message === expectedMessage;
};
