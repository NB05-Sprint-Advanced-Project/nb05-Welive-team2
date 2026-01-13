import { NextFunction, Request, Response } from 'express';
import { createBusinessException } from '../../shared/exceptioins/business-exception/business-exception';
import { BusinessExceptionType } from '../../shared/exceptioins/business-exception/exception-info';

export const createNotFoundMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    next(createBusinessException({ type: BusinessExceptionType.NOT_FOUND }));
  };
};

export type NotFoundMiddleware = ReturnType<typeof createNotFoundMiddleware>;
