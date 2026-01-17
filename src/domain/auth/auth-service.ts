import { BusinessException } from '../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../shared/exception/business-exception/exception-info';
import { IHashManager } from '../../shared/interface/i-bcrypt-hash-manager';
import { ITokenUtil } from '../../shared/utils/token-manager';
import { IUserQueryRepo } from '../user/interface/i-user-query-repo';
import { UserCommandRepo } from '../user/repo/user-command';

export const createAuthService = (
  userQueryRepo: IUserQueryRepo,
  hashManager: IHashManager,
  tokenManager: ITokenUtil,
) => {
  const login = async (username: string, password: string) => {
    const user = await userQueryRepo.findByUsername(username);
    if (!user) {
      throw BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    if (!(await hashManager.compare(password, user.password))) {
      throw BusinessException({
        type: BusinessExceptionType.INVALID_CREDENTIALS,
      });
    }

    const accessToken = tokenManager.generateAccessToken({
      userId: user.id,
    });

    const refreshToken = tokenManager.generateRefreshToken({
      userId: user.id,
    });

    return { user, accessToken, refreshToken };
  };

  const logout = async (token: string) => {
    // logout logic
  };

  const refreshToken = async (oldToken: string) => {
    return { token: 'new-sample-token' };
  };

  return { login, logout, refreshToken };
};

export type AuthService = ReturnType<typeof createAuthService>;
