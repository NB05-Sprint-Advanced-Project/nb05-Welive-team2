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
   * /api/v2/complaints/{complaintId}:
   *   get:
   *     summary: 민원 상세 조회
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

  /**
   * @openapi
   * /api/v2/complaints:
   *   get:
   *     summary: 민원 목록 조회
   *     tags: [Complaint]
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
   *         name: searchKeyword
   *         schema:
   *           type: string
   *         description: 검색어 (제목, 내용, 작성자 이름)
   *       - in: query
   *         name: status
   *         required: true
   *         schema:
   *           type: string
   *           enum: [PENDING, IN_PROGRESS, RESOLVED, REJECTED]
   *         description: "민원 상태 (Available values: PENDING, IN_PROGRESS, RESOLVED, REJECTED)"
   *       - in: query
   *         name: isPublic
   *         schema:
   *           type: boolean
   *         description: 공개 여부
   *       - in: query
   *         name: building
   *         schema:
   *           type: number
   *         description: 아파트 동(민원 작성자 기준)
   *       - in: query
   *         name: unit
   *         schema:
   *           type: number
   *         description: 아파트 호(민원 작성자 기준)
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
   *                     $ref: '#/components/schemas/Complaint'
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
   *                   createdAt: "2026-01-31T06:14:39.956Z"
   *                   updatedAt: "2026-01-31T06:14:39.956Z"
   *                   title: "string"
   *                   content: "string"
   *                   status: "PENDING"
   *                   isPublic: true
   *                   viewsCount: 0
   *                   apartmentId: "string"
   *                   complainant:
   *                     id: "string"
   *                     name: "string"
   *                   commentCount: 0
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
    catchHandler(handlers.getAllComplaints),
  );

  /**
   * @openapi
   * /api/v2/complaints:
   *   post:
   *     summary: 민원 생성
   *     tags: [Complaint]
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
   *               isPublic:
   *                 type: boolean
   *               apartmentId:
   *                 type: string
   *           example:
   *             title: "string"
   *             content: "string"
   *             isPublic: true
   *             apartmentId: "string"
   *     responses:
   *       201:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Complaint'
   *             example:
   *               id: "string"
   *               createdAt: "2026-01-31T06:28:05.762Z"
   *               updatedAt: "2026-01-31T06:28:05.762Z"
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
  router.post(
    '/',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.createComplaint),
  );

  /**
   * @openapi
   * /api/v2/complaints/{complaintId}:
   *   patch:
   *     summary: 민원 수정
   *     tags: [Complaint]
   *     parameters:
   *       - in: path
   *         name: complaintId
   *         required: true
   *         schema:
   *           type: string
   *         description: 수정할 민원의 ID
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
   *               isPublic:
   *                 type: boolean
   *           example:
   *             title: "string"
   *             content: "string"
   *             isPublic: true
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
    '/:complaintId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.updateComplaint),
  );

  /**
   * @openapi
   * /api/v2/complaints/{complaintId}:
   *   delete:
   *     summary: 민원 삭제
   *     tags: [Complaint]
   *     parameters:
   *       - in: path
   *         name: complaintId
   *         required: true
   *         schema:
   *           type: string
   *         description: 삭제할 민원의 ID
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
    '/:complaintId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.deleteComplaint),
  );

  /**
   * @openapi
   * /api/v2/complaints/{complaintId}/status:
   *   patch:
   *     summary: "[관리자 권한 필요] 민원 상태 수정"
   *     tags: [Complaint]
   *     parameters:
   *       - in: path
   *         name: complaintId
   *         required: true
   *         schema:
   *           type: string
   *         description: 상태를 수정할 민원의 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [PENDING, IN_PROGRESS, RESOLVED, REJECTED]
   *                 description: 변경할 민원 상태
   *           example:
   *             status: "IN_PROGRESS"
   *     responses:
   *       204:
   *         description: 성공적으로 상태가 수정됨
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.patch(
    '/:complaintId/status',
    catchHandler(middlewares.auth.authAdmin),
    catchHandler(handlers.updateComplaintStatus),
  );
};
