import { Router } from 'express';
import { catchHandler } from '../../../utils/controller-util';
import { UserHandlers } from './user-handler';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerUserRoutes = (
  router: Router,
  handlers: UserHandlers,
  middlewares: Middlewares,
) => {
  // #swagger.tags = ['User']
  // #swagger.summary = '슈퍼 관리자 생성'
  router.post('/super-admins', catchHandler(handlers.createSuperAdmin));

  // #swagger.tags = ['User']
  // #swagger.summary = '관리자 생성'
  router.post('/admins', catchHandler(handlers.createAdmin));

  // 관리자 계정
  // #swagger.tags = ['User']
  // #swagger.summary = '관리자 목록 조회'
  // #swagger.description = '슈퍼 관리자만 조회 가능'
  router.get(
    '/admins',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.getAdministrators),
  );

  // #swagger.tags = ['User']
  // #swagger.summary = '관리자 가입 상태 일괄 수정'
  // #swagger.description = '슈퍼 관리자만 수정 가능'
  router.patch(
    '/admins/join-status',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.updateAdminsJoinStatuses),
  );

  // #swagger.tags = ['User']
  // #swagger.summary = '거부된 관리자 삭제'
  // #swagger.description = '슈퍼 관리자만 삭제 가능'
  router.delete(
    '/admins/rejected',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.deleteRejectedAdmins),
  );

  // #swagger.tags = ['User']
  // #swagger.summary = '관리자 가입 상태 수정'
  // #swagger.description = '슈퍼 관리자만 수정 가능'
  // #swagger.parameters['id'] = { description: '관리자 ID' }
  router.patch(
    '/admins/:id/join-status',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.updateAdminJoinStatus),
  );

  // #swagger.tags = ['User']
  // #swagger.summary = '관리자 정보 수정'
  // #swagger.description = '슈퍼 관리자만 수정 가능'
  // #swagger.parameters['adminId'] = { description: '관리자 ID' }
  router.patch(
    '/admins/:adminId',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.updateAdmin),
  );

  // #swagger.tags = ['User']
  // #swagger.summary = '관리자 삭제'
  // #swagger.description = '슈퍼 관리자만 삭제 가능'
  // #swagger.parameters['adminId'] = { description: '관리자 ID' }
  router.delete(
    '/admins/:adminId',
    catchHandler(middlewares.auth.authSuperAdmin),
    catchHandler(handlers.deleteAdmin),
  );

  // 입주민 계정
  /**
   * @openapi
   * /api/v2/users/residents:
   *   post:
   *     summary: 입주민 계정 생성
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - contact
   *               - name
   *               - password
   *               - resident
   *             properties:
   *               username:
   *                 type: string
   *                 example: resident1
   *               email:
   *                 type: string
   *                 format: email
   *                 example: kim.resident1@example.com
   *               contact:
   *                 type: string
   *                 example: "01048164426"
   *               name:
   *                 type: string
   *                 example: 김입주
   *               password:
   *                 type: string
   *                 format: password
   *                 example: "123456qwe!"
   *               resident:
   *                 type: object
   *                 required:
   *                   - apartmentId
   *                   - building
   *                   - unit
   *                 properties:
   *                   apartmentId:
   *                     type: string
   *                     format: uuid
   *                     example: 33b67daa-e5a6-4386-9af8-e6bdb37617f0
   *                   building:
   *                     type: integer
   *                     example: 102
   *                   unit:
   *                     type: integer
   *                     example: 1203
   *     responses:
   *       201:
   *         description: 입주민 계정 생성 성공
   *       409:
   *         description: |
   *           중복 또는 충돌 오류
   *           - 아이디 중복
   *           - 이메일 중복
   *           - 전화번호 중복
   *           - 낙관적 락 충돌
   *       500:
   *         description: 서버 내부 오류
   */
  router.post('/residents', catchHandler(handlers.signUpResidentAccount));

  /**
   * @openapi
   * /api/v2/users/residents:
   *   get:
   *     summary: 입주민 계정 목록 조회
   *     description: |
   *       입주민 계정 목록을 조회합니다.
   *       이름/이메일 검색, 동/호수, 가입 상태 필터를 지원합니다.
   *       (관리자 전용 API)
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         description: 페이지 번호
   *         schema:
   *           type: integer
   *           example: 1
   *       - in: query
   *         name: limit
   *         description: 페이지당 조회 개수
   *         schema:
   *           type: integer
   *           example: 10
   *       - in: query
   *         name: searchKeyword
   *         description: 이름 또는 이메일 검색
   *         schema:
   *           type: string
   *           example: 김입주
   *       - in: query
   *         name: joinStatus
   *         description: 가입 상태 필터
   *         schema:
   *           type: string
   *           enum: [PENDING, APPROVED, REJECTED]
   *           example: PENDING
   *       - in: query
   *         name: building
   *         description: 동 번호
   *         schema:
   *           type: integer
   *           example: 101
   *       - in: query
   *         name: unit
   *         description: 호수
   *         schema:
   *           type: integer
   *           example: 1203
   *     responses:
   *       200:
   *         description: 입주민 계정 목록 조회 성공
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       503:
   *         description: 일시적으로 요청을 처리할 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  router.get(
    '/residents',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.getResidentAccounts),
  );

  /**
   * @openapi
   * /api/v2/users/residents/join-status:
   *   patch:
   *     summary: 입주민 계정 가입 상태 일괄 변경
   *     description: |
   *       가입 대기 중인 입주민 계정들의 가입 상태를 일괄 변경합니다.
   *       (관리자 전용 API)
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - joinStatus
   *             properties:
   *               joinStatus:
   *                 type: string
   *                 description: 변경할 가입 상태
   *                 enum:
   *                   - APPROVED
   *                   - REJECTED
   *                 example: APPROVED
   *     responses:
   *       204:
   *         description: 입주민 계정 가입 상태 일괄 변경 성공
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       404:
   *         description: 가입 대기 중인 입주민 계정이 존재하지 않음
   *       409:
   *         description: 낙관적 락 실패로 인한 동시 수정 충돌
   *       500:
   *         description: 서버 내부 오류
   */
  router.patch(
    '/residents/join-status',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.updateResidentAccountJoinStatuses),
  );

  /**
   * @openapi
   * /api/v2/users/residents/{id}/join-status:
   *   patch:
   *     summary: 입주민 계정 가입 상태 변경
   *     description: |
   *       특정 입주민 계정의 가입 상태를 변경합니다.
   *       (관리자 전용 API)
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: 가입 상태를 변경할 입주민 계정 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - joinStatus
   *             properties:
   *               joinStatus:
   *                 type: string
   *                 description: 변경할 가입 상태
   *                 enum:
   *                   - APPROVED
   *                   - REJECTED
   *                 example: APPROVED
   *     responses:
   *       204:
   *         description: 입주민 계정 가입 상태 변경 성공
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       404:
   *         description: 해당 입주민 계정을 찾을 수 없음
   *       409:
   *         description: 낙관적 락 실패로 인한 동시 수정 충돌
   *       500:
   *         description: 서버 내부 오류
   */
  router.patch(
    '/residents/:id/join-status',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.updateResidentAccountJoinStatus),
  );

  /**
   * @openapi
   * /api/v2/users/residents/rejected:
   *   delete:
   *     summary: 가입 거절된 입주민 계정 삭제
   *     description: |
   *       가입 상태가 REJECTED인 입주민 계정들을 일괄 삭제합니다.
   *       (관리자 전용 API)
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       204:
   *         description: 가입 거절된 입주민 계정 삭제 성공
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       500:
   *         description: 서버 내부 오류
   */
  router.delete(
    '/residents/rejected',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.deleteResidentAccounts),
  );

  // 공통
  /**
   * @openapi
   * /api/v2/users/me/avatar:
   *   patch:
   *     summary: 내 프로필 이미지 변경
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - image
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *                 description: 업로드할 이미지 파일
   *     responses:
   *       204:
   *         description: 프로필 이미지 변경 성공
   *       400:
   *         description: 이미지 업로드 실패
   *       401:
   *         description: 인증 실패
   *       404:
   *         description: 사용자 없음
   *       409:
   *         description: 동시성 충돌
   *       500:
   *         description: 서버 오류
   */
  router.patch(
    '/me/avatar',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(middlewares.multer.image()),
    catchHandler(handlers.updateAvatarUrl),
  );

  /**
   * @openapi
   * /api/v2/users/me/password:
   *   patch:
   *     summary: 내 비밀번호 변경
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - password
   *               - newPassword
   *             properties:
   *               password:
   *                 type: string
   *                 description: 현재 비밀번호
   *                 example: "string"
   *               newPassword:
   *                 type: string
   *                 description: 새 비밀번호
   *                 example: "string"
   *     responses:
   *       204:
   *         description: 비밀번호 변경 성공
   *       400:
   *         description: 비밀번호 검증 실패
   *       401:
   *         description: 인증 실패
   *       404:
   *         description: 사용자 없음
   *       409:
   *         description: 동시성 충돌
   *       500:
   *         description: 서버 오류
   */
  router.patch(
    '/me/password',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.updatePassword),
  );
};
