import { Router } from 'express';
import { PollHandler } from './poll-handler';
import { catchHandler } from '../../../utils/controller-util';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerPollRoutes = (
  router: Router,
  handler: PollHandler,
  middlewares: Middlewares,
) => {
  /**
   * @openapi
   * /api/v2/polls/{pollId}:
   *   get:
   *     summary: "투표 글 상세 조회"
   *     tags:
   *       - Poll
   *     parameters:
   *       - in: path
   *         name: pollId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Poll'
   *             example:
   *               id: string
   *               createdAt: 2026-01-31T07:23:15.263Z
   *               title: string
   *               content: string
   *               status: PENDING
   *               startDate: 2026-01-31T07:23:15.263Z
   *               endDate: 2026-01-31T07:23:15.263Z
   *               apartmentId: string
   *               building: 0
   *               author:
   *                 id: string
   *                 name: string
   *               options:
   *                 - id: string
   *                   title: string
   *                   voteCount: 0
   *               optionIdVotedByMe: string
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       404:
   *         description: 투표 글이 존재하지 않습니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.get(
    '/:pollId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handler.getPoll),
  );

  /**
   * @openapi
   * /api/v2/polls:
   *   get:
   *     summary: "투표 글 전체 조회"
   *     tags:
   *       - Poll
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
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum:
   *             - IN_PROGRESS
   *             - PENDING
   *             - CLOSED
   *             - ALL
   *           default: ALL
   *       - in: query
   *         name: building
   *         schema:
   *           type: integer
   *           default: 0
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
   *                     $ref: '#/components/schemas/Poll'
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
   *                   createdAt: 2026-01-31T07:28:29.298Z
   *                   title: string
   *                   content: string
   *                   status: PENDING
   *                   startDate: 2026-01-31T07:28:29.298Z
   *                   endDate: 2026-01-31T07:28:29.298Z
   *                   apartmentId: string
   *                   building: 0
   *                   author:
   *                     id: string
   *                     name: string
   *               totalCount: 0
   *               page: 0
   *               limit: 0
   *               hasNext: true
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.get('/', catchHandler(middlewares.auth.authenticate), catchHandler(handler.getAllPolls));

  /**
   * @openapi
   * /api/v2/polls:
   *   post:
   *     summary: "[관리자 권한 필요] 투표 글 생성"
   *     tags:
   *       - Poll
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - content
   *               - startDate
   *               - endDate
   *               - apartmentId
   *               - building
   *               - options
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *               startDate:
   *                 type: string
   *                 format: date-time
   *               endDate:
   *                 type: string
   *                 format: date-time
   *               apartmentId:
   *                 type: string
   *               building:
   *                 type: integer
   *               options:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - title
   *                   properties:
   *                     title:
   *                       type: string
   *           example:
   *             title: string
   *             content: string
   *             startDate: 2026-01-31T07:51:27.881Z
   *             endDate: 2026-01-31T07:51:27.881Z
   *             apartmentId: string
   *             building: 0
   *             options:
   *               - title: string
   *     responses:
   *       201:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                 title:
   *                   type: string
   *                 content:
   *                   type: string
   *                 status:
   *                   type: string
   *                   enum:
   *                     - PENDING
   *                     - IN_PROGRESS
   *                     - CLOSED
   *                 startDate:
   *                   type: string
   *                   format: date-time
   *                 endDate:
   *                   type: string
   *                   format: date-time
   *                 apartmentId:
   *                   type: string
   *                 building:
   *                   type: integer
   *                 author:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     name:
   *                       type: string
   *             example:
   *               id: string
   *               createdAt: 2026-01-31T07:51:27.897Z
   *               title: string
   *               content: string
   *               status: PENDING
   *               startDate: 2026-01-31T07:51:27.897Z
   *               endDate: 2026-01-31T07:51:27.897Z
   *               apartmentId: string
   *               building: 0
   *               author:
   *                 id: string
   *                 name: string
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.post('/', catchHandler(middlewares.auth.authAdmin), catchHandler(handler.createPoll));

  /**
   * @openapi
   * /api/v2/polls/{pollId}:
   *   patch:
   *     summary: "[관리자 권한 필요] 투표 글 수정"
   *     tags:
   *       - Poll
   *     parameters:
   *       - in: path
   *         name: pollId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *               startDate:
   *                 type: string
   *                 format: date-time
   *               endDate:
   *                 type: string
   *                 format: date-time
   *               building:
   *                 type: integer
   *               options:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/UpdateOption'
   *           example:
   *             title: string
   *             content: string
   *             startDate: 2026-01-31T06:44:33.769Z
   *             endDate: 2026-01-31T06:44:33.769Z
   *             building: 0
   *             options:
   *               - id: string
   *                 title: string
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
    '/:pollId',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handler.updatePoll),
  );

  /**
   * @openapi
   * /api/v2/polls/{pollId}:
   *   delete:
   *     summary: "[관리자 권한 필요] 투표 글 삭제"
   *     tags:
   *       - Poll
   *     parameters:
   *       - in: path
   *         name: pollId
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
    '/:pollId',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handler.deletePoll),
  );

  /**
   * @openapi
   * /api/v2/polls/{pollId}/options/{optionId}/vote:
   *   post:
   *     summary: "투표하기"
   *     tags:
   *       - Poll
   *     parameters:
   *       - in: path
   *         name: pollId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: optionId
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
  router.post(
    '/:pollId/options/:optionId/vote',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handler.vote),
  );

  /**
   * @openapi
   * /api/v2/polls/{pollId}/options/{optionId}/vote:
   *   delete:
   *     summary: "투표 취소"
   *     tags:
   *       - Poll
   *     parameters:
   *       - in: path
   *         name: pollId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: optionId
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
    '/:pollId/options/:optionId/vote',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handler.cancle),
  );
};
