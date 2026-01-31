import { Router } from 'express';
import { AuthHandlers } from './auth-handler';
import { catchHandler } from '../../../utils/controller-util';

export const registerAuthRoutes = (router: Router, handlers: AuthHandlers) => {
  /**
   * @openapi
   * /api/v2/auth/login:
   *   post:
   *     summary: 로그인
   *     description: 사용자 인증을 진행하고 성공 시 사용자 정보를 반환하며, 토큰을 HttpOnly 쿠키로 설정합니다.
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *           example:
   *             username: "string"
   *             password: "string"
   *     responses:
   *       200:
   *         description: 로그인 성공 시 사용자 정보를 반환하고 HttpOnly 쿠키로 토큰을 설정합니다.
   *         headers:
   *           Set-Cookie:
   *             schema:
   *               type: array
   *               items:
   *                 type: string
   *             description: "인증 토큰 (access_token 15분, refresh_token 7일)"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 username:
   *                   type: string
   *                 email:
   *                   type: string
   *                 contact:
   *                   type: string
   *                 name:
   *                   type: string
   *                 role:
   *                   type: string
   *                   enum: [SUPER_ADMIN, ADMIN, RESIDENT]
   *                 avatar:
   *                   type: string
   *                 joinStatus:
   *                   type: string
   *                   enum: [PENDING, APPROVED, REJECTED]
   *                 isActive:
   *                   type: boolean
   *                 adminOf:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     name:
   *                       type: string
   *                 resident:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     apartmentId:
   *                       type: string
   *                     building:
   *                       type: number
   *                     unit:
   *                       type: number
   *                     isHouseholder:
   *                       type: boolean
   *             example:
   *               id: "string"
   *               username: "string"
   *               email: "string"
   *               contact: "string"
   *               name: "string"
   *               role: "SUPER_ADMIN"
   *               avatar: "string"
   *               joinStatus: "PENDING"
   *               isActive: true
   *               adminOf:
   *                 id: "string"
   *                 name: "string"
   *               resident:
   *                 id: "string"
   *                 apartmentId: "string"
   *                 building: 0
   *                 unit: 0
   *                 isHouseholder: true
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다. (아이디 또는 비밀번호 불일치)
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.post('/login', catchHandler(handlers.login));

  /**
   * @openapi
   * /api/v2/auth/logout:
   *   post:
   *     summary: 로그아웃
   *     description: HttpOnly 쿠키에 저장된 인증 토큰을 만료시켜 로그아웃을 처리합니다.
   *     tags: [Auth]
   *     responses:
   *       204:
   *         description: 로그아웃 성공 시 쿠키를 삭제합니다.
   *         headers:
   *           Set-Cookie:
   *             description: "인증 토큰 삭제 (쿠키 만료)"
   *             schema:
   *               type: array
   *               items:
   *                 type: string
   *               example:
   *                 - "access_token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0"
   *                 - "refresh_token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0"
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.post('/logout', catchHandler(handlers.logout));

  /**
   * @openapi
   * /api/v2/auth/refresh:
   *   post:
   *     summary: 토큰 갱신
   *     description: refresh_token 쿠키를 사용하여 새로운 access_token과 refresh_token을 발급받습니다.
   *     tags: [Auth]
   *     parameters:
   *       - in: header
   *         name: Cookie
   *         required: true
   *         schema:
   *           type: string
   *         example: "refresh_token=eyJhbGciOiJSUzI1NiI..."
   *         description: "refresh_token 쿠키 필요 (예: refresh_token=...)"
   *     responses:
   *       204:
   *         description: 토큰 갱신 성공 시 새로운 토큰을 쿠키로 설정합니다.
   *         headers:
   *           Set-Cookie:
   *             description: "갱신된 인증 토큰 (access_token 15분, refresh_token 7일)"
   *             schema:
   *               type: array
   *               items:
   *                 type: string
   *               example:
   *                 - "access_token=eyJhbGciOiJSUzI1NiI...; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=900"
   *                 - "refresh_token=eyJhbGciOiJSUzI1NiI...; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800"
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.post('/refresh', catchHandler(handlers.refreshToken));
};
