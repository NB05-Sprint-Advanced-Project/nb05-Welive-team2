import { BusinessException } from '../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../shared/exception/business-exception/exception-info';
import { IHashManager } from '../../shared/interface/i-bcrypt-hash-manager';
import { ITokenUtil } from '../../shared/utils/token-manager';
import { IUserQueryRepo } from '../user/interface/i-user-query-repo';
import { CookieTokenDTO, LoginDTO } from './dto/auth-request';

export const createAuthService = (
  userQueryRepo: IUserQueryRepo,
  hashManager: IHashManager,
  tokenManager: ITokenUtil,
) => {
  const getCookieValue = (cookieHeader: string | undefined, name: string) => {
    if (!cookieHeader) {
      return undefined;
    }
    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
    if (!match) {
      return undefined;
    }
    return match.substring(name.length + 1);
  };

  const login = async (dto: LoginDTO) => {
    const user = await userQueryRepo.findByUsername(dto.username);
    if (!user) {
      throw BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    if (!(await hashManager.compare(dto.password, user.password))) {
      throw BusinessException({
        type: BusinessExceptionType.INVALID_CREDENTIALS,
      });
    }

    const accessToken = tokenManager.generateAccessToken({
      userId: user.id,
      role: user.role,
      name: user.name,
    });

    const refreshToken = tokenManager.generateRefreshToken({
      userId: user.id,
    });

    const { password, ...userWithoutPassword } = user;
    return { userWithoutPassword, accessToken, refreshToken };
  };

  const refreshToken = async (dto: CookieTokenDTO) => {
    const oldToken = getCookieValue(dto.cookie, 'refresh_token');
    if (!oldToken) {
      throw BusinessException({
        type: BusinessExceptionType.BAD_REQUEST,
      });
    }

    const payload = await tokenManager.verifyToken({ token: oldToken });

    const accessToken = await tokenManager.generateAccessToken({
      userId: payload.userId,
    });

    const refreshToken = await tokenManager.generateRefreshToken({
      userId: payload.userId,
    });

    return { accessToken, refreshToken };
  };

  return { login, refreshToken };
};

export type AuthService = ReturnType<typeof createAuthService>;
