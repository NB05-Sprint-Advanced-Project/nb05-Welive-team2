import { NextFunction, Request, Response } from 'express';
import { BusinessException } from '../../shared/exceptioins/business-exception/business-exception';
import { BusinessExceptionType } from '../../shared/exceptioins/business-exception/exception-info';

export const createNotFoundMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    next(BusinessException(BusinessExceptionType.NOT_FOUND));
  };
};
