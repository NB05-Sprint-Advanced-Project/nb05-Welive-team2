import { AuthService } from '../auth-service';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { validate } from '../../../utils/controller-util';
import { loginSchema, cookieTokenSchema } from '../dto/auth-request';

export const createAuthHandlers = (authService: AuthService) => {
  const login = async (req: any, res: any) => {
    const dto = validate(loginSchema, req.body);

    const { userWithoutPassword, accessToken, refreshToken } = await authService.login(dto);

    // cookies 설정
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15분
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/',
    });
    return res.status(200).json(userWithoutPassword);
  };

  const logout = async (req: any, res: any) => {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return res.status(204).send();
  };

  const refreshToken = async (req: any, res: any) => {
    const dto = validate(cookieTokenSchema, req.headers);

    const { accessToken, refreshToken } = await authService.refreshToken(dto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15분
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/',
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
