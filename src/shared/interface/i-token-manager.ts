export type TokenPayload = {
  userId: string;
  role?: string;
  name?: string;
};

export type SecretTokenPayload = {
  userId: string;
  role: string;
  name: string;
  exp: number;
};

export interface ITokenUtil {
  generateAccessToken(payload: TokenPayload): string;

  generateRefreshToken(payload: TokenPayload): string;

  generateCsrfValue(): string;

  /**
   * ignoreExpiration이 false이고 토큰이 만료된 경우 예외를 던집니다.
   * @throws {BusinessException}
   */
  verifyToken(props: { token: string; ignoreExpiration?: boolean }): SecretTokenPayload;

  getCookieValue(cookieHeader: string | undefined, name: string): string | undefined;
}
