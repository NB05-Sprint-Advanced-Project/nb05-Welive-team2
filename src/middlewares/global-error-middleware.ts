import { NextFunction, Request, Response } from 'express';
import { getEnv } from '../config';
import { isBusinessException } from '../shared/exception/business-exception/business-exception';
import { isTechnicalException } from '../shared/exception/technical-exception/technical-exception';

export const createGlobalErrorMiddleware = () => {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    const isDev = getEnv().NODE_ENV === 'development';
    if (isBusinessException(err)) {
      if (isDev) console.error(err);
      return res.status(err.statusCode).json({ message: err.message });
    }

    if (isTechnicalException(err)) {
      if (isDev) console.error(err);
      return res.json({ message: err.message, meta: err.meta });
    }

    if (isDev) console.error(err);
    return res.status(500).json({ message: '알 수 없는 서버 에러입니다.' });
  };
};

export type GlobalErrorMiddleware = ReturnType<typeof createGlobalErrorMiddleware>;
