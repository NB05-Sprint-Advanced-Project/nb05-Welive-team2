import { UserCommandRepo } from 'src/outbound/repos/command/user-command-repo';
import { createBusinessException } from '../../../shared/exceptioins/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exceptioins/business-exception/exception-info';
import { IHashManager } from 'src/application/ports/managers/i-bcrypt-hash-manager';
import { ITokenUtil } from 'src/shared/utils/token-manager';

export const createAuthCommandService = (
  userCommandRepo: UserCommandRepo,
  hashManager: IHashManager,
  tokenManager: ITokenUtil,
) => {
  const login = async (username: string, password: string) => {
    const user = await userCommandRepo.findByUsername(username);
    if (!user) {
      throw createBusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    if (!(await hashManager.compare(password, user.password))) {
      throw createBusinessException({
        type: BusinessExceptionType.INVALID_CREDENTIALS,
      });
    }

    const token = tokenManager.generateAccessToken({
      userId: user.id,
    });

    return { user: user, token: token };
  };

  const logout = async (token: string) => {
    // logout logic
  };

  const refreshToken = async (oldToken: string) => {
    return { token: 'new-sample-token' };
  };

  return { login, logout, refreshToken };
};

export type AuthCommandService = ReturnType<typeof createAuthCommandService>;
