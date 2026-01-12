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

export const TechnicalException = (props: {
  type: TechnicalExceptionType;
  error?: Error;
  meta?: unknown;
  message?: string;
}) => {
  const { type, error, meta, message } = props;

  const exception = new Error(message ?? TechnicalExceptionTable[type]) as TechnicalException;
  exception.error = error;
  exception.type = type;
  exception.meta = meta;
  return exception;
};

// 에러 타입 가드
export const isTechnicalException = (error: unknown): error is TechnicalException => {
  if (!(error instanceof Error)) return false;

  const maybe = error as Partial<TechnicalException>;

  return (
    typeof maybe.type === 'number' &&
    typeof maybe.message === 'string' &&
    TechnicalExceptionTable[maybe.type as TechnicalExceptionType] !== undefined
  );
};
