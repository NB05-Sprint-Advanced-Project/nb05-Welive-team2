import jwt, { TokenExpiredError } from 'jsonwebtoken';
import crypto from 'crypto';
import { getEnv } from '../../config';
import { BusinessExceptionType } from '../exception/business-exception/exception-info';
import { BusinessException } from '../exception/business-exception/business-exception';
import { ITokenUtil, TokenPayload, SecretTokenPayload } from '../interface/i-token-manager';

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
      }) as SecretTokenPayload;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw BusinessException({
          type: BusinessExceptionType.TOKEN_EXPIRED,
        });
      }
      throw err;
    }
  };

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

  return {
    generateAccessToken,
    generateRefreshToken,
    generateCsrfValue,
    verifyToken,
    getCookieValue,
  };
};
