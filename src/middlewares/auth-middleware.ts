import { Request, Response, NextFunction } from 'express';
import { BusinessException } from '../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../shared/exception/business-exception/exception-info';
import { ITokenUtil } from '../shared/utils/token-manager';

export const createAuthMiddleware = (tokenUtil: ITokenUtil) => {
  const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const cookie = req.cookies;
    const access_token = cookie['access_token'];
    if (!access_token) {
      throw BusinessException({ type: BusinessExceptionType.INVALID_AUTH });
    }

    const payload = tokenUtil.verifyToken({ token: access_token });
    req.userId = payload.userId;
    return next();
  };

  return { authenticate };
};

export type AuthMiddleware = ReturnType<typeof createAuthMiddleware>;
