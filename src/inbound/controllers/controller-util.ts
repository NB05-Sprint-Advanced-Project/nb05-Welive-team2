import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';
import { CreateBusinessException } from '../../shared/exceptioins/business-exception/business-exception';
import { BusinessExceptionType } from '../../shared/exceptioins/business-exception/exception-info';

export const validate = <T extends z.ZodType>(schema: T, data: unknown) => {
  const parsedDate = schema.safeParse(data);
  if (!parsedDate.success) {
    throw CreateBusinessException({
      type: BusinessExceptionType.INVALID_INPUT,
      message: parsedDate.error.issues[0].message,
    });
  }

  return parsedDate.data;
};

export const catchHandler = (handler: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
