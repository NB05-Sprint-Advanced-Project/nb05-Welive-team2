import { Request, Response, NextFunction } from 'express';
import { BusinessException } from '../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../shared/exception/business-exception/exception-info';
import { ITokenUtil } from '../shared/utils/token-manager';

export const createAuthMiddleware = (tokenUtil: ITokenUtil) => {
  const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookie = req.cookies;
      const access_token = cookie['access_token'];
      if (!access_token) {
        return next(BusinessException({ type: BusinessExceptionType.INVALID_AUTH }));
      }

      const payload = tokenUtil.verifyToken({ token: access_token });
      req.user = {
        userId: payload.userId,
        role: payload.role,
      };

      req.userId = payload.userId;

      return next();
    } catch (err) {
      return next(BusinessException({ type: BusinessExceptionType.TOKEN_EXPIRED }));
    }
  };

  const authSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookie = req.cookies;
      const access_token = cookie['access_token'];
      if (!access_token) {
        return next(BusinessException({ type: BusinessExceptionType.INVALID_AUTH }));
      }

      const payload = tokenUtil.verifyToken({ token: access_token });

      if (payload.role !== 'SUPER_ADMIN') {
        return next(BusinessException({ type: BusinessExceptionType.NOT_SUPERADMIN }));
      }

      req.user = {
        userId: payload.userId,
        role: payload.role,
      };
      return next();
    } catch (err) {
      return next(BusinessException({ type: BusinessExceptionType.TOKEN_EXPIRED }));
    }
  };

  const authAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookie = req.cookies;
      const access_token = cookie['access_token'];
      if (!access_token) {
        return next(BusinessException({ type: BusinessExceptionType.INVALID_AUTH }));
      }

      const payload = tokenUtil.verifyToken({ token: access_token });

      if (payload.role !== 'ADMIN') {
        return next(BusinessException({ type: BusinessExceptionType.NOT_ADMIN }));
      }

      req.user = {
        userId: payload.userId,
        role: payload.role,
      };
      return next();
    } catch (err) {
      return next(BusinessException({ type: BusinessExceptionType.TOKEN_EXPIRED }));
    }
  };

  return { authenticate, authSuperAdmin, authAdmin };
};

export type AuthMiddleware = ReturnType<typeof createAuthMiddleware>;
