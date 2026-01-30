import { Request, Response, NextFunction } from 'express';
import { BusinessException } from '../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../shared/exception/business-exception/exception-info';
import { ITokenUtil } from '../shared/utils/token-manager';
import { Role } from '../domain/user/entity/base-user';
import { redisKeys } from '../utils/redis-keys';
import { IRedisExternal } from '../shared/interface/i-redis';

export const createAuthMiddleware = (tokenUtil: ITokenUtil, redisExternal: IRedisExternal) => {
  const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookie = req.cookies;
      const access_token = cookie['access_token'];
      if (!access_token) {
        return next(BusinessException({ type: BusinessExceptionType.INVALID_AUTH }));
      }

      const key = redisKeys.authToken(access_token);
      const cached = await redisExternal.get(key);
      if (cached) {
        const payload = JSON.parse(cached);

        req.user = {
          userId: payload.userId,
          role: payload.role,
          name: payload.name,
        };
        req.userId = payload.userId;
        return next();
      }
      const payload = tokenUtil.verifyToken({ token: access_token });

      await redisExternal.set(
        key,
        JSON.stringify({
          userId: payload.userId,
          role: payload.role,
          name: payload.name,
        }),
        300,
      );

      req.user = {
        userId: payload.userId,
        role: payload.role,
        name: payload.name,
      };

      req.userId = payload.userId;

      return next();
    } catch (err) {
      return next(BusinessException({ type: BusinessExceptionType.TOKEN_EXPIRED }));
    }
  };

  const authSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookie = req.cookies;
      const access_token = cookie['access_token'];
      if (!access_token) {
        return next(BusinessException({ type: BusinessExceptionType.INVALID_AUTH }));
      }

      const key = redisKeys.authToken(access_token);
      const cached = await redisExternal.get(key);
      if (cached) {
        const payload = JSON.parse(cached);

        if (payload.role !== Role.SUPER_ADMIN) {
          return next(BusinessException({ type: BusinessExceptionType.NOT_SUPERADMIN }));
        }
        req.user = {
          userId: payload.userId,
          role: payload.role,
          name: payload.name,
        };
        req.userId = payload.userId;
        return next();
      }
      const payload = tokenUtil.verifyToken({ token: access_token });

      await redisExternal.set(
        key,
        JSON.stringify({
          userId: payload.userId,
          role: payload.role,
          name: payload.name,
        }),
        300,
      );

      if (payload.role !== Role.SUPER_ADMIN) {
        return next(BusinessException({ type: BusinessExceptionType.NOT_SUPERADMIN }));
      }

      req.user = {
        userId: payload.userId,
        role: payload.role,
        name: payload.name,
      };
      req.userId = payload.userId;
      return next();
    } catch (err) {
      return next(BusinessException({ type: BusinessExceptionType.TOKEN_EXPIRED }));
    }
  };

  const authAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookie = req.cookies;
      const access_token = cookie['access_token'];
      if (!access_token) {
        return next(BusinessException({ type: BusinessExceptionType.INVALID_AUTH }));
      }

      const key = redisKeys.authToken(access_token);
      const cached = await redisExternal.get(key);
      if (cached) {
        const payload = JSON.parse(cached);

        if (payload.role !== Role.ADMIN) {
          return next(BusinessException({ type: BusinessExceptionType.NOT_ADMIN }));
        }
        req.user = {
          userId: payload.userId,
          role: payload.role,
          name: payload.name,
        };
        req.userId = payload.userId;
        return next();
      }

      const payload = tokenUtil.verifyToken({ token: access_token });

      await redisExternal.set(
        key,
        JSON.stringify({
          userId: payload.userId,
          role: payload.role,
          name: payload.name,
        }),
        300,
      );

      if (payload.role !== Role.ADMIN) {
        return next(BusinessException({ type: BusinessExceptionType.NOT_ADMIN }));
      }

      req.user = {
        userId: payload.userId,
        role: payload.role,
        name: payload.name,
      };
      req.userId = payload.userId;
      return next();
    } catch (err) {
      return next(BusinessException({ type: BusinessExceptionType.TOKEN_EXPIRED }));
    }
  };

  return { authenticate, authSuperAdmin, authAdmin };
};

export type AuthMiddleware = ReturnType<typeof createAuthMiddleware>;
