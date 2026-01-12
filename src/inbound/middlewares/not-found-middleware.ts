import { NextFunction, Request, Response } from 'express';
import { CreateBusinessException } from '../../shared/exceptioins/business-exception/business-exception';
import { BusinessExceptionType } from '../../shared/exceptioins/business-exception/exception-info';

export const createNotFoundMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    next(CreateBusinessException({ type: BusinessExceptionType.NOT_FOUND }));
  };
};

export type NotFoundMiddleware = ReturnType<typeof createNotFoundMiddleware>;
