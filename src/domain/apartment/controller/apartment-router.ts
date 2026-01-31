import { Router } from 'express';
import { catchHandler } from '../../../utils/controller-util';
import { ApartmentHandlers } from './apartment-handler';

export const registerApartmentRoutes = (router: Router, handlers: ApartmentHandlers) => {
  /**
   * @openapi
   * /api/v2/apartments:
   *   get:
   *     summary: 아파트 목록 조회
   *     tags: [Apartment]
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
   *         description: 검색어 (이름, 주소, 설명, 관리소 전화번호)
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
   *                       name:
   *                         type: string
   *                       address:
   *                         type: string
   *                       description:
   *                         type: string
   *                       officeNumber:
   *                         type: string
   *                       buildings:
   *                         type: array
   *                         items:
   *                           type: number
   *                       units:
   *                         type: array
   *                         items:
   *                           type: number
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
   *                     name: "string"
   *                     address: "string"
   *                     description: "string"
   *                     officeNumber: "string"
   *                     buildings: [0]
   *                     units: [0]
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
  router.get('/', catchHandler(handlers.getApartments));

  /**
   * @openapi
   * /api/v2/apartments/{id}:
   *   get:
   *     summary: 아파트 상세 조회
   *     tags: [Apartment]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: 아파트 단지 ID
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 name:
   *                   type: string
   *                 address:
   *                   type: string
   *                 description:
   *                   type: string
   *                 officeNumber:
   *                   type: string
   *                 buildings:
   *                   type: array
   *                   items:
   *                     type: number
   *                 units:
   *                   type: array
   *                   items:
   *                     type: number
   *               example:
   *                 id: "string"
   *                 name: "string"
   *                 address: "string"
   *                 description: "string"
   *                 officeNumber: "string"
   *                 buildings: [0]
   *                 units: [0]
   *       400:
   *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
   *       401:
   *         description: 권한과 관련된 오류입니다.
   *       500:
   *         description: 알 수 없는 오류입니다.
   */
  router.get('/:apartmentId', catchHandler(handlers.getApartment));
  return { router };
};
