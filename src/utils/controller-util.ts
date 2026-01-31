import { Request, Response, NextFunction, RequestHandler, Router } from 'express';
import { z } from 'zod';
import { BusinessException } from '../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../shared/exception/business-exception/exception-info';
import multer from 'multer';

export const createBaseController = (basePath: string) => {
  const path: string = basePath;
  const router = Router();
  return { path, router };
};

export const validate = <T extends z.ZodType>(schema: T, data: unknown) => {
  const parsedData = schema.safeParse(data);
  if (!parsedData.success) {
    throw BusinessException({
      type: BusinessExceptionType.INVALID_INPUT,
      message: parsedData.error.issues[0].message,
    });
  }

  return parsedData.data;
};

export const catchHandler = (handler: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          throw BusinessException({
            type: BusinessExceptionType.FILE_SIZE_EXCEEDED,
          });
        }
      }

      next(err);
    }
  };
};
