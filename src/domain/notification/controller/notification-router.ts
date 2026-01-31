import { Router } from 'express';
import path from 'path';
import { catchHandler } from '../../../utils/controller-util';
import { NotificationHandlers } from './notification-handler';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerNotificationRoutes = (
  router: Router,
  middleware: Middlewares,
  handlers: NotificationHandlers,
) => {
  /**
   * @openapi
   * /api/v2/notifications:
   *   get:
   *     summary: 알림 목록 조회
   *     tags: [Notifications]
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
   *                       content:
   *                         type: string
   *                       isChecked:
   *                         type: boolean
   *                 totalCount:
   *                   type: number
   *                 page:
   *                   type: number
   *                 limit:
   *                   type: number
   *                 hasNext:
   *                   type: boolean
   *               example:
   *                 data:
   *                   - id: "string"
   *                     createdAt: "2026-01-31T08:34:31.291Z"
   *                     content: "string"
   *                     isChecked: true
   *                 totalCount: 0
   *                 page: 0
   *                 limit: 0
   *                 hasNext: true
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.get('/', middleware.auth.authenticate, catchHandler(handlers.getNotifications));

  /**
   * @openapi
   * /api/v2/notifications/{notificationId}/read:
   *   patch:
   *     summary: 특정 알림 읽음 처리
   *     description: "특정 알림을 읽음 상태(isChecked: true)로 변경합니다."
   *     tags: [Notifications]
   *     parameters:
   *       - in: path
   *         name: notificationId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 읽음 처리할 알림의 UUID
   *     responses:
   *       204:
   *         description: 성공적으로 읽음 처리됨 (응답 본문 없음)
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.patch(
    '/:notificationId/read',
    middleware.auth.authenticate,
    catchHandler(handlers.markAsRead),
  );
  /**
   * @openapi
   * /api/v2/notifications/sse:
   *   get:
   *     summary: 실시간 알림 스트리밍 (SSE)
   *     description: >
   *       로그인한 사용자는 이 SSE(EventSource) 연결을 통해 30초 간격으로 새로 생성된 알림을 실시간 스트리밍 방식으로 수신합니다.
   *       서버는 text/event-stream 형식으로 응답하며, 클라이언트는 지속적인 연결을 통해 새 알림을 즉시 감지할 수 있습니다.
   *     tags: [Notifications]
   *     responses:
   *       200:
   *         description: text/event-stream 형식의 스트리밍 응답
   *         content:
   *           text/event-stream:
   *             schema:
   *               type: object
   *               properties:
   *                 type:
   *                   type: string
   *                   description: 이벤트 타입 (예시 alarm)
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
   *                       content:
   *                         type: string
   *                       isChecked:
   *                         type: boolean
   *               example:
   *                 type: "alarm"
   *                 data:
   *                   - id: "string"
   *                     createdAt: "2026-01-31T08:34:44.865Z"
   *                     content: "string"
   *                     isChecked: true
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.get('/sse', middleware.auth.authenticate, catchHandler(handlers.getLiveNotification));

  return { path, router };
};
