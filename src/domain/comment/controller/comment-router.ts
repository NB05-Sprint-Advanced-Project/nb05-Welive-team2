import { Router } from 'express';
import { catchHandler } from '../../../utils/controller-util';
import { CommentHandlers } from './comment-handler';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerCommentRouters = (
  router: Router,
  middlewares: Middlewares,
  handlers: CommentHandlers,
) => {
  /**
   * @openapi
   * /api/v2/comments:
   *   get:
   *     summary: 댓글 목록 조회
   *     tags: [Comment]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: number
   *         description: 페이지 번호
   *       - in: query
   *         name: limit
   *         schema:
   *           type: number
   *         description: 페이지 당 항목 수
   *       - in: query
   *         name: resourceId
   *         required: true
   *         schema:
   *           type: string
   *         description: 댓글 리소스 ID
   *       - in: query
   *         name: resourceType
   *         required: true
   *         schema:
   *           type: string
   *           enum: [NOTICE, COMPLAINT]
   *         description: "댓글 리소스 유형 (Available values: NOTICE, COMPLAINT)"
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
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                       content:
   *                         type: string
   *                       author:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           name:
   *                             type: string
   *                 totalCount:
   *                   type: number
   *                 page:
   *                   type: number
   *                 limit:
   *                   type: number
   *                 hasNext:
   *                   type: boolean
   *             example:
   *               data:
   *                 - id: "string"
   *                   createdAt: "2026-01-31T06:32:35.929Z"
   *                   updatedAt: "2026-01-31T06:32:35.929Z"
   *                   content: "string"
   *                   author:
   *                     id: "string"
   *                     name: "string"
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
  router.get(
    '/',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.getAllComments),
  );

  /**
   * @openapi
   * /api/v2/comments:
   *   post:
   *     summary: 댓글 생성
   *     tags: [Comment]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               content:
   *                 type: string
   *                 description: 댓글 내용
   *               resourceId:
   *                 type: string
   *                 description: 댓글이 달릴 리소스의 ID
   *               resourceType:
   *                 type: string
   *                 enum: [NOTICE, COMPLAINT]
   *                 description: "리소스 타입 (예: NOTICE)"
   *           example:
   *             content: "string"
   *             resourceId: "string"
   *             resourceType: "NOTICE"
   *     responses:
   *       201:
   *         description: Created
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
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                 content:
   *                   type: string
   *                 author:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     name:
   *                       type: string
   *             example:
   *               id: "string"
   *               createdAt: "2026-01-31T06:32:02.079Z"
   *               updatedAt: "2026-01-31T06:32:02.079Z"
   *               content: "string"
   *               author:
   *                 id: "string"
   *                 name: "string"
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.post(
    '/',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.createComment),
  );

  /**
   * @openapi
   * /api/v2/comments/{commentId}:
   *   patch:
   *     summary: 댓글 수정
   *     tags: [Comment]
   *     parameters:
   *       - in: path
   *         name: commentId
   *         required: true
   *         schema:
   *           type: string
   *         description: 수정할 댓글의 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               content:
   *                 type: string
   *                 description: 수정할 댓글 내용
   *           example:
   *             content: "string"
   *     responses:
   *       204:
   *         description: 성공적으로 수정됨 (응답 본문 없음)
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.patch(
    '/:commentId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.updateComment),
  );

  /**
   * @openapi
   * /api/v2/comments/{commentId}:
   *   delete:
   *     summary: 댓글 삭제
   *     tags: [Comment]
   *     parameters:
   *       - in: path
   *         name: commentId
   *         required: true
   *         schema:
   *           type: string
   *         description: 삭제할 댓글의 ID
   *     responses:
   *       204:
   *         description: 성공적으로 삭제됨 (응답 본문 없음)
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.delete(
    '/:commentId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.deleteComment),
  );
};
