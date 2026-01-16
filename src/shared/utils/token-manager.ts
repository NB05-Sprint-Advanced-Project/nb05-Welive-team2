import jwt, { TokenExpiredError } from 'jsonwebtoken';
import crypto from 'crypto';
import { getEnv } from '../../config';
import { BusinessExceptionType } from '../exception/business-exception/exception-info';
import { BusinessException } from '../exception/business-exception/business-exception';

export type TokenPayload = {
  userId: string;
  exp: number;
};

export interface ITokenUtil {
  generateAccessToken(payload: Omit<TokenPayload, 'exp'>): string;

  generateRefreshToken(payload: Omit<TokenPayload, 'exp'>): string;

  generateCsrfValue(): string;

  /**
   * ignoreExpiration이 false이고 토큰이 만료된 경우 예외를 던집니다.
   * @throws {BusinessException}
   */
  verifyToken(props: { token: string; ignoreExpiration?: boolean }): TokenPayload;
}

export const TokenUtil = (): ITokenUtil => {
  const generateAccessToken = (payload: TokenPayload) => {
    return jwt.sign(payload, getEnv().TOKEN_SECRET, {
      expiresIn: getEnv().ACCESS_TOKEN_EXPIRES_IN,
    });
  };

  const generateRefreshToken = (payload: TokenPayload) => {
    return jwt.sign(payload, getEnv().TOKEN_SECRET, {
      expiresIn: getEnv().REFRESH_TOKEN_EXPIRES_IN,
    });
  };
  const generateCsrfValue = () => {
    return crypto.randomBytes(16).toString('hex');
  };
  const verifyToken = (props: { token: string; ignoreExpiration?: boolean }) => {
    try {
      const { token, ignoreExpiration } = props;
      return jwt.verify(token, getEnv().TOKEN_SECRET, {
        ignoreExpiration,
      }) as TokenPayload;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw BusinessException({
          type: BusinessExceptionType.TOKEN_EXPIRED,
        });
      }
      throw err;
    }
  };

  return {
    generateAccessToken,
    generateRefreshToken,
    generateCsrfValue,
    verifyToken,
  };
};
