import { BusinessExceptionTable, BusinessExceptionType } from './exception-info';

/* example
throw BusinessException(props:{type: BusinessExceptionType.NOT_FOUND})

*/

export type BusinessException = Error & {
  type: BusinessExceptionType;
  statusCode: number;
  error?: Error;
};

export const CreateBusinessException = (props: {
  type: BusinessExceptionType;
  error?: Error;
  message?: string;
}) => {
  const { type, error, message } = props;

  const exception = new Error(message ?? BusinessExceptionTable[type].message) as BusinessException;
  exception.statusCode = BusinessExceptionTable[type].statusCode;
  exception.type = type;
  exception.error = error;
  return exception;
};

// 에러 타입 가드
export const isBusinessException = (error: unknown): error is BusinessException => {
  if (!(error instanceof Error)) return false;

  // 글로벌에서는 어떤 에러가 들어오는지 확정 짓을 수 없어서 Partial로 사용
  const maybe = error as Partial<BusinessException>;

  return (
    typeof maybe.statusCode === 'number' &&
    typeof maybe.message === 'string' &&
    typeof maybe.type === 'string' &&
    BusinessExceptionTable[maybe.type as BusinessExceptionType] !== undefined
  );
};
