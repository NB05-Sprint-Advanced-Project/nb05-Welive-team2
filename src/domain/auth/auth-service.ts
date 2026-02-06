import { BusinessException } from '../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../shared/exception/business-exception/exception-info';
import { IHashManager } from '../../shared/interface/i-bcrypt-hash-manager';
import { ITokenUtil } from '../../shared/interface/i-token-manager';
import { IUserQueryRepo } from '../user/interface/i-user-query-repo';
import { CookieTokenDTO, LoginDTO } from './dto/auth-request';

export const createAuthService = (
  userQueryRepo: IUserQueryRepo,
  hashManager: IHashManager,
  tokenManager: ITokenUtil,
) => {
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

    const apartmentId = user.adminOf?.id ?? user.resident?.apartmentId;

    const accessToken = tokenManager.generateAccessToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      apartmentId,
    });

    const refreshToken = tokenManager.generateRefreshToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      apartmentId,
    });

    const { ...userWithoutPassword } = user;
    return { userWithoutPassword, accessToken, refreshToken };
  };

  const refreshToken = (dto: CookieTokenDTO) => {
    const oldToken = dto.refreshToken;

    if (!oldToken) {
      throw BusinessException({
        type: BusinessExceptionType.BAD_REQUEST,
      });
    }

    const payload = tokenManager.verifyToken({ token: oldToken });

    const accessToken = tokenManager.generateAccessToken({
      userId: payload.userId,
      role: payload.role,
      name: payload.name,
      apartmentId: payload.apartmentId,
    });

    const refreshToken = tokenManager.generateRefreshToken({
      userId: payload.userId,
      role: payload.role,
      name: payload.name,
      apartmentId: payload.apartmentId,
    });

    return { accessToken, refreshToken };
  };

  return { login, refreshToken };
};

export type AuthService = ReturnType<typeof createAuthService>;
