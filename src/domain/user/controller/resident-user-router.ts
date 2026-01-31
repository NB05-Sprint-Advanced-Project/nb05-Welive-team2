import { Router } from 'express';
import { catchHandler } from '../../../utils/controller-util';
import { ResidentUserHandlers } from './resident-user-handler';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerResidentUserRoutes = (
  router: Router,
  handlers: ResidentUserHandlers,
  middlewares: Middlewares,
) => {
  /**
   * @openapi
   * /api/v2/residents:
   *   post:
   *     summary: 입주민 계정 생성
   *     description: |
   *       입주민 계정을 생성합니다.
   *       * 생성된 입주민은 가입 대기(PENDING) 상태입니다.
   *       * (관리자 전용 API)
   *     tags: [Resident]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - contact
   *               - building
   *               - unit
   *             properties:
   *               name:
   *                 type: string
   *                 example: 홍길동
   *               email:
   *                 type: string
   *                 example: hong@test.com
   *               contact:
   *                 type: string
   *                 example: 01012345678
   *               building:
   *                 type: string
   *                 example: "101"
   *               unit:
   *                 type: string
   *                 example: "1203"
   *     responses:
   *       201:
   *         description: 입주민 계정 생성 성공
   *       400:
   *         description: 잘못된 요청
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       409:
   *         description: 이메일 또는 연락처 중복
   *       500:
   *         description: 서버 내부 오류
   */
  router.post('/', catchHandler(middlewares.auth.authAdmin), catchHandler(handlers.createResident));

  /**
   * @openapi
   * /api/v2/residents:
   *   get:
   *     summary: 입주민 목록 조회
   *     description: 입주민 목록을 조회합니다. * 이름/이메일/연락처 검색, 동/호수, 세대주 여부, 등록 여부 필터를 지원합니다. * (관리자 전용 API)
   *     tags: [Resident]
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
   *         description: 이름 / 이메일 / 연락처 검색
   *         schema:
   *           type: string
   *           example: 홍길동
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
   *       - in: query
   *         name: isHouseholder
   *         description: 세대주 여부
   *         schema:
   *           type: boolean
   *           example: true
   *       - in: query
   *         name: isRegistered
   *         description: 계정 등록 여부
   *         schema:
   *           type: boolean
   *           example: true
   *     responses:
   *       200:
   *         description: 입주민 목록 조회 성공
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       503:
   *         description: 일시적으로 요청을 처리할 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  router.get('/', catchHandler(middlewares.auth.authAdmin), catchHandler(handlers.getResidents));

  /**
   * @openapi
   * /api/v2/residents/{id}:
   *   get:
   *     summary: 입주민 단건 조회
   *     description: 입주민 상세 정보를 조회합니다. * (관리자 전용 API)
   *     tags: [Resident]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: 입주민 ID
   *         schema:
   *           type: string
   *           format: uuid
   *           example: "33b67daa-e5a6-4386-9af8-e6bdb37617f0"
   *     responses:
   *       200:
   *         description: 입주민 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: string
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: 2026-01-31T07:57:30.433Z
   *                 email:
   *                   type: string
   *                   example: string
   *                 contact:
   *                   type: string
   *                   example: string
   *                 name:
   *                   type: string
   *                   example: string
   *                 building:
   *                   type: integer
   *                   example: 101
   *                 unit:
   *                   type: integer
   *                   example: 1203
   *                 isHouseholder:
   *                   type: boolean
   *                   example: true
   *                 userId:
   *                   type: string
   *                   example: string
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       404:
   *         description: 입주민을 찾을 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  router.get('/:id', catchHandler(middlewares.auth.authAdmin), catchHandler(handlers.getResident));

  /**
   * @openapi
   * /api/v2/residents/{id}:
   *   patch:
   *     summary: 입주민 정보 수정
   *     description: 입주민 정보를 수정합니다. * 이메일, 연락처, 이름, 동/호수, 세대주 여부를 수정할 수 있습니다. * (관리자 전용 API)
   *     tags: [Resident]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: 입주민 ID
   *         schema:
   *           type: string
   *           format: uuid
   *           example: "33b67daa-e5a6-4386-9af8-e6bdb37617f0"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: test@test.com
   *               contact:
   *                 type: string
   *                 example: "01012345678"
   *               name:
   *                 type: string
   *                 example: 홍길동
   *               building:
   *                 type: integer
   *                 example: 101
   *               unit:
   *                 type: integer
   *                 example: 1203
   *               isHouseholder:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       204:
   *         description: 입주민 정보 수정 성공
   *       400:
   *         description: 잘못된 요청
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       404:
   *         description: 입주민을 찾을 수 없음
   *       409:
   *         description: 연락처 중복 또는 동시 수정 충돌
   *       500:
   *         description: 서버 내부 오류
   */
  router.patch(
    '/:id',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.updateResident),
  );

  /**
   * @openapi
   * /api/v2/residents/{id}:
   *   delete:
   *     summary: 입주민 삭제
   *     description: 입주민 정보를 삭제합니다. * (관리자 전용 API)
   *     tags: [Resident]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: 입주민 ID
   *         schema:
   *           type: string
   *           format: uuid
   *           example: "33b67daa-e5a6-4386-9af8-e6bdb37617f0"
   *     responses:
   *       204:
   *         description: 입주민 삭제 성공
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       500:
   *         description: 서버 내부 오류
   */
  router.delete(
    '/:id',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.deleteResident),
  );

  /**
   * @openapi
   * /api/v2/residents/file/template:
   *   get:
   *     summary: 입주민 CSV 템플릿 다운로드
   *     description: 입주민 일괄 등록을 위한 CSV 템플릿 파일을 다운로드합니다. * (관리자 전용 API)
   *     tags: [Resident]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: CSV 템플릿 다운로드 성공
   *         headers:
   *           Content-Type:
   *             description: CSV 파일 컨텐츠 타입
   *             schema:
   *               type: string
   *               example: text/csv
   *           Content-Disposition:
   *             description: 파일 다운로드 헤더
   *             schema:
   *               type: string
   *               example: attachment; filename="resident_bulk_template.csv"
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       404:
   *         description: 템플릿 파일을 찾을 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  router.get(
    '/file/template',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.exportResidentTemplate),
  );

  /**
   * @openapi
   * /api/v2/residents/file/import:
   *   post:
   *     summary: 입주민 CSV 파일 업로드 (일괄 등록)
   *     description: 입주민 정보를 CSV 파일로 업로드하여 일괄 등록합니다. * (관리자 전용 API)
   *     tags: [Resident]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - file
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: |
   *                   입주민 CSV 파일
   *                   (컬럼 순서: 동, 호수, 이름, 연락처, 이메일, 세대주여부)
   *     responses:
   *       204:
   *         description: 입주민 CSV 일괄 등록 성공
   *       400:
   *         description: CSV 형식 오류
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       404:
   *         description: 아파트 정보를 찾을 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  router.post(
    '/file/import',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(middlewares.multer.csv()),
    catchHandler(handlers.importResidentsFromCsv),
  );

  /**
   * @openapi
   * /api/v2/residents/file/export:
   *   get:
   *     summary: 입주민 목록 CSV 파일 다운로드
   *     description: 입주민 목록을 CSV 파일로 다운로드합니다. * (관리자 전용 API)
   *     tags: [Resident]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 입주민 목록 CSV 다운로드 성공
   *         headers:
   *           Content-Type:
   *             description: CSV 파일 컨텐츠 타입
   *             schema:
   *               type: string
   *               example: text/csv
   *           Content-Disposition:
   *             description: 파일 다운로드 헤더
   *             schema:
   *               type: string
   *               example: attachment; filename="residents_export.csv"
   *       401:
   *         description: 인증 실패
   *       403:
   *         description: 관리자 권한 필요
   *       404:
   *         description: 가져올 유저가 존재하지 않음
   *       500:
   *         description: 서버 내부 오류
   */
  router.get(
    '/file/export',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.exportResidents),
  );
};
