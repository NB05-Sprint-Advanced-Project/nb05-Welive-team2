import { NextFunction, Request, Response } from 'express';
import { BusinessException } from '../../shared/exceptioins/business-exception/business-exception';
import { TechnicalException } from '../../shared/exceptioins/technical-exception/technical-exception';
import { IUtils } from '../../shared/i-utils';

export const createGlobalErrorMiddleware = (utils: IUtils) => {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    const isDev = utils.config.NODE_ENV === 'development';

    if (err.type === 'BusinessException') {
      if (isDev) console.error(err);
      return res.status(err.statusCode).json({ message: err.message });
    }

    if (err instanceof TechnicalException) {
      if (isDev) console.error(err);
      return res.status(500).json({ message: '서버 내부 오류입니다.' });
    }

    if (isDev) console.error(err);
    return res.status(500).json({ message: '알 수 없는 서버 에러입니다.' });
  };
};

export type GlobalErrorMiddleware = ReturnType<typeof createGlobalErrorMiddleware>;
