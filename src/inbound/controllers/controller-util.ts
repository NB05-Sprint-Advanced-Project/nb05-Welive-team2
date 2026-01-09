import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';

export const validate = <T extends z.ZodType>(schema: T, data: unknown) => {
  const parsedDate = schema.safeParse(data);
  if (!parsedDate.success) {
    throw new Error();
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
