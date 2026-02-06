// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { validate } from '../../../shared/utils/controller-util';
// import { AuthService } from '../auth-service';
// import { loginSchema, cookieTokenSchema } from '../dto/auth-request';
// import { Request, Response } from 'express';

// export const createAuthHandlers = (authService: AuthService) => {
//   const login = async (req: Request, res: Response) => {
//     const dto = validate(loginSchema, req.body);

//     const { userWithoutPassword, accessToken, refreshToken } = await authService.login(dto);

//     // cookies 설정
//     res.cookie('access_token', accessToken, {
//       httpOnly: true,
//       secure: false,
//       sameSite: 'lax',
//       maxAge: 15 * 60 * 1000, // 15분
//       path: '/',
//     });

//     // 쿠키 감
//     res.cookie('refresh_token', refreshToken, {
//       httpOnly: true,
//       secure: false, // 개발 환경에서는 false, 배포 환경에서는 true
//       sameSite: 'lax',
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
//       path: '/',
//     });
//     return res.status(200).json(userWithoutPassword);
//   };

//   const logout = async (req: Request, res: Response) => {
//     res.clearCookie('access_token', {
//       httpOnly: true,
//       secure: true,
//       sameSite: 'none',
//       path: '/',
//     });
//     res.clearCookie('refresh_token', {
//       httpOnly: true,
//       secure: true,
//       sameSite: 'none',
//       path: '/',
//     });
//     return res.status(204).send();
//   };

//   const refreshToken = async (req: Request, res: Response) => {
//     const cookie = req.headers.cookie;
//     const dto = validate(cookieTokenSchema, { cookie });
//     const { accessToken, refreshToken } = await authService.refreshToken(dto);

//     res.cookie('access_token', accessToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: 'none',
//       maxAge: 15 * 60 * 1000, // 15분
//       path: '/',
//     });

//     res.cookie('refresh_token', refreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: 'none',
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
//       path: '/',
//     });

//     return res.status(204).send();
//   };

//   return {
//     login,
//     logout,
//     refreshToken,
//   };
// };

// export type AuthHandlers = ReturnType<typeof createAuthHandlers>;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRedisExternal } from '../../../shared/interface/i-redis';
import { validate } from '../../../shared/utils/controller-util';
import { AuthService } from '../auth-service';
import { loginSchema, cookieTokenSchema } from '../dto/auth-request';
import { Request, Response } from 'express';

export const createAuthHandlers = (authService: AuthService, redisExternal: IRedisExternal) => {
  /**
   * 쿠키 옵션을 한 곳에서 통일
   * - HTTP 환경 기준
   * - login / refresh / logout 전부 동일해야 브라우저가 같은 쿠키로 인식함
   */
  const cookieOptions = {
    httpOnly: true,
    secure: false, // HTTPS 아니므로 false
    sameSite: 'lax' as const,
    path: '/',
  };

  const login = async (req: Request, res: Response) => {
    const dto = validate(loginSchema, req.body);

    const { userWithoutPassword, accessToken, refreshToken } = await authService.login(dto);

    // access token 쿠키
    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15분
    });

    // refresh token 쿠키
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    return res.status(200).json(userWithoutPassword);
  };

  const logout = async (req: Request, res: Response) => {
    //  login 때와 동일한 옵션으로 clear 해야 실제로 삭제됨
    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return res.status(204).send();
  };

  const refreshToken = async (req: Request, res: Response) => {
    // req.headers.cookie (raw string) 사용 금지
    // cookie-parser 기준 req.cookies 사용
    const oldAccessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    // validate 대상도 raw cookie가 아니라 실제 refreshToken
    const dto = validate(cookieTokenSchema, { refreshToken });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await authService.refreshToken(dto);

    if (oldAccessToken) {
      await redisExternal.del(`auth:token:${oldAccessToken}`);
    }

    // access token 재발급
    res.cookie('access_token', newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    // refresh token 재발급
    res.cookie('refresh_token', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(204).send();
  };

  return {
    login,
    logout,
    refreshToken,
  };
};

export type AuthHandlers = ReturnType<typeof createAuthHandlers>;
