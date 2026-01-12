import { NextFunction, Request, Response } from 'express';
import {
  BusinessException,
  isBusinessException,
} from '../../shared/exceptioins/business-exception/business-exception';
import { isTechnicalException } from '../../shared/exceptioins/technical-exception/technical-exception';
import { IUtils } from '../../shared/i-utils';
import { ZodError } from 'zod';

export const createGlobalErrorMiddleware = (utils: IUtils) => {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    const isDev = utils.config.NODE_ENV === 'development';

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
