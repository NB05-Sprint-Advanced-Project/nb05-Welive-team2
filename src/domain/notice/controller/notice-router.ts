import { Router } from 'express';
import { NoticeHandler } from './notice-handler';
import { catchHandler } from '../../../utils/controller-util';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerNoticeRoutes = (
  router: Router,
  handler: NoticeHandler,
  middleware: Middlewares,
) => {
  /**
   * @openapi
   * /notices/{noticeId}:
   *   get:
   *     summary: 공지사항 상세 조회
   *     tags:
   *       - Notice
   *     parameters:
   *       - in: path
   *         name: noticeId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Notice'
   *             example:
   *               id: string
   *               createdAt: 2026-01-31T06:27:35.370Z
   *               updatedAt: 2026-01-31T06:27:35.370Z
   *               title: string
   *               content: string
   *               category: MAINTENANCE
   *               isPinned: true
   *               viewsCount: 0
   *               apartmentId: string
   *               author:
   *                 id: string
   *                 name: string
   *               commentCount: 0
   *               event:
   *                 id: string
   *                 startDate: 2026-01-31T06:27:35.370Z
   *                 endDate: 2026-01-31T06:27:35.370Z
   *       400:
   *         description: 잘못된 요청
   *       401:
   *         description: 권한 오류
   *       404:
   *         description: 존재하지 않음
   *       500:
   *         description: 서버 오류
   */
  router.get(
    '/notices/:noticeId',
    catchHandler(middleware.auth.authenticate),
    catchHandler(handler.getNotice),
  );

  /**
   * @openapi
   * /notices:
   *   get:
   *     summary: 공지사항 목록 조회
   *     tags:
   *       - Notice
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *       - in: query
   *         name: searchKeyword
   *         schema:
   *           type: string
   *           default: ""
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum:
   *             - MAINTENANCE
   *             - URGENT
   *             - COMMUNITY
   *             - VOTING
   *             - BOARD_MEETING
   *             - ETC
   *             - ALL
   *           default: ALL
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Notice'
   *                 totalCount:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 limit:
   *                   type: integer
   *                 hasNext:
   *                   type: boolean
   *             example:
   *               data:
   *                 - id: string
   *                   createdAt: 2026-01-31T06:36:42.940Z
   *                   updatedAt: 2026-01-31T06:36:42.940Z
   *                   title: string
   *                   content: string
   *                   category: MAINTENANCE
   *                   isPinned: true
   *                   viewsCount: 0
   *                   apartmentId: string
   *                   author:
   *                     id: string
   *                     name: string
   *                   commentCount: 0
   *               totalCount: 0
   *               page: 1
   *               limit: 10
   *               hasNext: true
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.get(
    '/notices',
    catchHandler(middleware.auth.authenticate),
    catchHandler(handler.getAllNotices),
  );

  /**
   * @openapi
   * /notices:
   *   post:
   *     summary: [관리자 권한 필요] 공지사항 등록
   *     tags:
   *       - Notice
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - content
   *               - category
   *               - isPinned
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *               category:
   *                 type: string
   *                 enum:
   *                   - MAINTENANCE
   *                   - URGENT
   *                   - COMMUNITY
   *                   - VOTING
   *                   - BOARD_MEETING
   *                   - ETC
   *               isPinned:
   *                 type: boolean
   *               event:
   *                 $ref: '#/components/schemas/Event'
   *           example:
   *             title: string
   *             content: string
   *             category: MAINTENANCE
   *             isPinned: true
   *             event:
   *               startDate: 2026-01-31T06:44:33.769Z
   *               endDate: 2026-01-31T06:44:33.769Z
   *     responses:
   *       201:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Notice'
   *             example:
   *               id: "string"
   *               createdAt: "2026-01-31T07:07:16.386Z"
   *               updatedAt: "2026-01-31T07:07:16.386Z"
   *               title: "string"
   *               content: "string"
   *               category: "MAINTENANCE"
   *               isPinned: true
   *               viewsCount: 0
   *               apartmentId: "string"
   *               author:
   *                 id: "string"
   *                 name: "string"
   *               commentCount: 0
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.post(
    '/notices',
    catchHandler(middleware.auth.authAdmin),
    catchHandler(handler.createNotice),
  );

  /**
   * @openapi
   * /notices/{noticeId}:
   *   patch:
   *     summary: [관리자 권한 필요] 공지사항 수정
   *     tags:
   *       - Notice
   *     parameters:
   *       - in: path
   *         name: noticeId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *               category:
   *                 type: string
   *                 enum:
   *                   - MAINTENANCE
   *                   - URGENT
   *                   - COMMUNITY
   *                   - VOTING
   *                   - BOARD_MEETING
   *                   - ETC
   *               isPinned:
   *                 type: boolean
   *               event:
   *                 $ref: '#/components/schemas/Event'
   *           example:
   *             title: "string"
   *             content: "string"
   *             category: "MAINTENANCE"
   *             isPinned: true
   *             event:
   *               startDate: "2026-01-31T06:44:33.769Z"
   *               endDate: "2026-01-31T06:44:33.769Z"
   *     responses:
   *       204:
   *         description: OK
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.patch(
    '/notices/:noticeId',
    catchHandler(middleware.auth.authAdmin),
    catchHandler(handler.updateNotice),
  );

  /**
   * @openapi
   * /notices/{noticeId}:
   *   delete:
   *     summary: [관리자 권한 필요] 공지사항 삭제
   *     tags:
   *       - Notice
   *     parameters:
   *       - in: path
   *         name: noticeId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: OK
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.delete(
    '/notices/:noticeId',
    catchHandler(middleware.auth.authAdmin),
    catchHandler(handler.deleteNotice),
  );

  /**
   * @openapi
   * /events:
   *   get:
   *     summary: 이벤트 목록 조회
   *     tags:
   *       - Event
   *     parameters:
   *       - in: query
   *         name: apartmentId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: year
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: month
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Event'
   *             example:
   *               - id: string
   *                 startDate: 2026-01-31T07:11:05.767Z
   *                 endDate: 2026-01-31T07:11:05.767Z
   *                 category: string
   *                 title: string
   *                 apartmentId: string
   *                 resourceId: string
   *                 resourceType: NOTICE
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)
   *       401:
   *         description: 권한과 관련된 오류
   *       500:
   *         description: 알 수 없는 오류
   */
  router.get(
    '/events',
    catchHandler(middleware.auth.authenticate),
    catchHandler(handler.getEvents),
  );
};
