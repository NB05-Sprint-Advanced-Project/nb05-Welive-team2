import { Router } from 'express';
import { ComplaintHanders } from './complaint-handler';
import { catchHandler } from '../../../utils/controller-util';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerComplaintRouters = (
  router: Router,
  middlewares: Middlewares,
  handlers: ComplaintHanders,
) => {
  /**
   * @openapi
   * /complaints/{complaintId}:
   *   get:
   *     summary: 신고 상세 조회
   *     tags: [Complaint]
   *     parameters:
   *       - in: path
   *         name: complaintId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Complaint'
   *             example:
   *               id: "string"
   *               createdAt: "2026-01-30T09:36:15.007Z"
   *               updatedAt: "2026-01-30T09:36:15.007Z"
   *               title: "string"
   *               content: "string"
   *               status: "PENDING"
   *               isPublic: true
   *               viewsCount: 0
   *               apartmentId: "string"
   *               complainant:
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
  router.get(
    '/:complaintId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.getComplaint),
  );

  router.get(
    '/',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.getAllComplaints),
  );

  router.post(
    '/',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.createComplaint),
  );

  router.patch(
    '/:complaintId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.updateComplaint),
  );

  router.delete(
    '/:complaintId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.deleteComplaint),
  );

  router.patch(
    '/:complaintId/status',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.updateComplaintStatus),
  );
};
